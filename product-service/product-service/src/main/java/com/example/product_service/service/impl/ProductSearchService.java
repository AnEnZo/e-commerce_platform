package com.example.product_service.service.impl;

import co.elastic.clients.elasticsearch._types.SortMode;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.search.ResponseBody;
import com.example.product_service.document.ProductDocument;
import com.example.product_service.document.ProductSearchResponse;
import com.example.product_service.document.ProductVariantDocument;
import com.example.product_service.dto.ProductDTO;
import com.example.product_service.dto.SearchCriteria;
import com.example.product_service.dto.SearchFilters;
import com.example.product_service.entity.Product;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.repository.ProductDocumentRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.ReactiveElasticsearchClient;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.StringWriter;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class ProductSearchService {

    private final ProductDocumentRepository esRepo; // reactive repository: returns Flux/Mono
    private final ProductMapper productMapper;
    private final ReactiveElasticsearchClient esClient;

    //////////////////////////////
    // Simple keyword search (reactive)
    //////////////////////////////
    public Mono<ProductSearchResponse> searchByKeyword(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return Flux.<ProductDocument>empty()
                    .collectList()
                    .map(list -> buildPagedResponse(list, pageable, "salesCount", "desc"));
        }

        return esRepo.findByNameContainingIgnoreCase(keyword)
                .collectList()
                .map(list -> buildPagedResponse(list, pageable, "salesCount", "desc"));
    }

    //////////////////////////////
    // Advanced search (reactive)
    //////////////////////////////
    public Mono<ProductSearchResponse> advancedSearch(SearchCriteria criteria, Pageable pageable) {
        final String INDEX = "products";

        try {
            BoolQuery.Builder rootBool = new BoolQuery.Builder();

            // keyword
            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                rootBool.must(q -> q.multiMatch(mm -> mm
                        .fields("name^2.0", "description^1.0")
                        .query(criteria.getKeyword())
                        .type(TextQueryType.BestFields)
                        .fuzziness("AUTO")
                ));
            }

            if (criteria.getCategoryName() != null && !criteria.getCategoryName().isBlank()) {
                rootBool.must(q -> q.match(m -> m
                        .field("categoryName")
                        .query(criteria.getCategoryName())
                ));
            }

            if (criteria.getShopId() != null && !criteria.getShopId().isBlank()) {
                rootBool.must(q -> q.term(t -> t
                        .field("shopId")
                        .value(criteria.getShopId())
                ));
            }

            if (criteria.getShopName() != null && !criteria.getShopName().isBlank()) {
                rootBool.must(q -> q.match(m -> m
                        .field("shopName")
                        .query(criteria.getShopName())
                ));
            }

            if (criteria.getStatus() != null && !criteria.getStatus().isBlank()) {
                rootBool.must(q -> q.term(t -> t
                        .field("status")
                        .value(criteria.getStatus())
                ));
            }

            if (criteria.getMinRating() != null) {
                rootBool.must(q -> q.range(r -> r
                        .field("averageRating")
                        .gte(co.elastic.clients.json.JsonData.of(criteria.getMinRating()))
                ));
            }

            // variant nested
            boolean hasVariantFilter = criteria.isInStockOnly()
                    || (criteria.getColor() != null && !criteria.getColor().isBlank())
                    || (criteria.getSize() != null && !criteria.getSize().isBlank())
                    || (criteria.getMinPrice() != null || criteria.getMaxPrice() != null);

            if (hasVariantFilter) {
                rootBool.must(q -> q.nested(n -> n
                        .path("variants")
                        .query(buildVariantQuery(criteria))
                        .scoreMode(ChildScoreMode.Avg)
                ));
            }

            Query finalQuery = buildFinalQuery(rootBool);

            // pagination
            int pageSize = Math.max(1, Math.min(pageable.getPageSize(), 1000));
            int from = Math.max(0, (int) pageable.getOffset());

            // sort
            List<co.elastic.clients.elasticsearch._types.SortOptions> sortOptions = buildSortOptions(pageable);

            logQuery(finalQuery, criteria);

            // Reactive search
            Mono<ResponseBody<ProductDocument>> respMono = esClient.search(
                    s -> s.index(INDEX)
                            .query(finalQuery)
                            .from(from)
                            .size(pageSize)
                            .sort(sortOptions)
                            .trackTotalHits(t -> t.enabled(true)),
                    ProductDocument.class
            );

            return respMono.map(resp -> buildSearchResponseFromReactive(resp, pageable))
                    .onErrorMap(e -> {
                        log.error("Elasticsearch reactive search failed for criteria: {}", criteria, e);
                        return new RuntimeException("Search service temporarily unavailable", e);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in advanced search: {}", criteria, e);
            return Mono.error(new RuntimeException("Search failed", e));
        }
    }

    //////////////////////////////
    // buildVariantQuery (same logic, returns Query)
    //////////////////////////////
    private Query buildVariantQuery(SearchCriteria criteria) {
        BoolQuery.Builder variantBool = new BoolQuery.Builder();

        if (criteria.isInStockOnly()) {
            variantBool.must(q -> q.range(r -> r
                    .field("variants.quantityOnHand")
                    .gt(co.elastic.clients.json.JsonData.of(0))
            ));
        }

        if (criteria.getColor() != null && !criteria.getColor().isBlank()) {
            variantBool.must(q -> q.term(t -> t
                    .field("variants.color")
                    .value(criteria.getColor())
            ));
        }

        if (criteria.getSize() != null && !criteria.getSize().isBlank()) {
            variantBool.must(q -> q.term(t -> t
                    .field("variants.size")
                    .value(criteria.getSize())
            ));
        }

        if (criteria.getMinPrice() != null || criteria.getMaxPrice() != null) {
            BoolQuery.Builder priceQuery = new BoolQuery.Builder();

            if (criteria.getMinPrice() != null && criteria.getMaxPrice() != null) {
                priceQuery.should(s -> s.bool(b -> b
                        .must(m -> m.exists(e -> e.field("variants.salePrice")))
                        .must(m -> m.range(r -> r.field("variants.salePrice")
                                .gte(co.elastic.clients.json.JsonData.of(criteria.getMinPrice()))
                                .lte(co.elastic.clients.json.JsonData.of(criteria.getMaxPrice()))
                        ))
                ));

                priceQuery.should(s -> s.bool(b -> b
                        .mustNot(mn -> mn.exists(e -> e.field("variants.salePrice")))
                        .must(m -> m.range(r -> r.field("variants.basePrice")
                                .gte(co.elastic.clients.json.JsonData.of(criteria.getMinPrice()))
                                .lte(co.elastic.clients.json.JsonData.of(criteria.getMaxPrice()))
                        ))
                ));
            } else if (criteria.getMinPrice() != null) {
                priceQuery.should(s -> s.bool(b -> b
                        .must(m -> m.exists(e -> e.field("variants.salePrice")))
                        .must(m -> m.range(r -> r.field("variants.salePrice")
                                .gte(co.elastic.clients.json.JsonData.of(criteria.getMinPrice()))
                        ))
                ));

                priceQuery.should(s -> s.bool(b -> b
                        .mustNot(mn -> mn.exists(e -> e.field("variants.salePrice")))
                        .must(m -> m.range(r -> r.field("variants.basePrice")
                                .gte(co.elastic.clients.json.JsonData.of(criteria.getMinPrice()))
                        ))
                ));
            } else {
                priceQuery.should(s -> s.bool(b -> b
                        .must(m -> m.exists(e -> e.field("variants.salePrice")))
                        .must(m -> m.range(r -> r.field("variants.salePrice")
                                .lte(co.elastic.clients.json.JsonData.of(criteria.getMaxPrice()))
                        ))
                ));

                priceQuery.should(s -> s.bool(b -> b
                        .mustNot(mn -> mn.exists(e -> e.field("variants.salePrice")))
                        .must(m -> m.range(r -> r.field("variants.basePrice")
                                .lte(co.elastic.clients.json.JsonData.of(criteria.getMaxPrice()))
                        ))
                ));
            }

            priceQuery.minimumShouldMatch("1");
            variantBool.must(m -> m.bool(priceQuery.build()));
        }

        return Query.of(q -> q.bool(variantBool.build()));
    }

    //////////////////////////////
    // buildFinalQuery same as original
    //////////////////////////////
    private Query buildFinalQuery(BoolQuery.Builder boolBuilder) {
        BoolQuery boolQuery = boolBuilder.build();

        boolean hasClauses = (boolQuery.must() != null && !boolQuery.must().isEmpty()) ||
                (boolQuery.should() != null && !boolQuery.should().isEmpty()) ||
                (boolQuery.mustNot() != null && !boolQuery.mustNot().isEmpty()) ||
                (boolQuery.filter() != null && !boolQuery.filter().isEmpty());

        if (!hasClauses) {
            return Query.of(q -> q.matchAll(ma -> ma));
        }

        return Query.of(q -> q.bool(boolQuery));
    }

    //////////////////////////////
    // buildSortOptions (unchanged logic)
    //////////////////////////////
    private List<co.elastic.clients.elasticsearch._types.SortOptions> buildSortOptions(Pageable pageable) {
        List<co.elastic.clients.elasticsearch._types.SortOptions> sortOptions = new ArrayList<>();

        if (pageable.getSort() != null && pageable.getSort().isSorted()) {
            for (Sort.Order order : pageable.getSort()) {
                String raw = order.getProperty();
                String field = mapSortField(raw);
                SortOrder sortOrder = order.isAscending() ? SortOrder.Asc : SortOrder.Desc;

                if ("variants.basePrice".equals(field) || "variants.salePrice".equals(field) || "price".equals(raw.toLowerCase())) {
                    String nestedField = field;
                    sortOptions.add(co.elastic.clients.elasticsearch._types.SortOptions.of(s -> s.field(f -> f
                            .field(nestedField)
                            .order(sortOrder)
                            .mode(SortMode.Min)
                            .nested(n -> n.path("variants"))
                            .missing("_last")
                    )));
                } else {
                    sortOptions.add(co.elastic.clients.elasticsearch._types.SortOptions.of(s -> s.field(f -> f
                            .field(field)
                            .order(sortOrder)
                            .missing("_last")
                    )));
                }
            }
        } else {
            sortOptions.add(co.elastic.clients.elasticsearch._types.SortOptions.of(s -> s.field(f -> f
                    .field("salesCount")
                    .order(SortOrder.Desc)
                    .missing("_last")
            )));
        }

        return sortOptions;
    }

    private String mapSortField(String fieldName) {
        switch (fieldName.toLowerCase()) {
            case "name": return "name.keyword";
            case "price": return "variants.basePrice";
            case "rating": return "averageRating";
            case "sales": return "salesCount";
            case "createdat": return "createdAt";
            default: return fieldName;
        }
    }

    //////////////////////////////
    // Build response from reactive ES response
    //////////////////////////////
    private ProductSearchResponse buildSearchResponseFromReactive(ResponseBody<ProductDocument> resp, Pageable pageable) {
        List<ProductDTO> dtos = resp.hits().hits().stream()
                .map(Hit::source)
                .filter(Objects::nonNull)
                .map(productMapper::toDtoFromDocument)
                .collect(Collectors.toList());

        long totalHits = Optional.ofNullable(resp.hits().total()).map(t -> t.value()).orElse(0L);

        int totalElements = (int) Math.min(totalHits, Integer.MAX_VALUE);
        int pageSize = Math.max(1, pageable.getPageSize());
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / pageSize);

        ProductSearchResponse response = new ProductSearchResponse();
        response.setProducts(dtos);
        response.setTotalElements(totalElements);
        response.setTotalPages(totalPages);
        response.setCurrentPage(pageable.getPageNumber());
        response.setPageSize(pageSize);

        if (pageable.getSort() != null && pageable.getSort().isSorted()) {
            Sort.Order firstOrder = pageable.getSort().iterator().next();
            response.setSortBy(firstOrder.getProperty());
            response.setSortDirection(firstOrder.isAscending() ? "asc" : "desc");
        } else {
            response.setSortBy("salesCount");
            response.setSortDirection("desc");
        }

        response.setAggregations(Collections.emptyMap());
        return response;
    }

    //////////////////////////////
    // logQuery (same)
    //////////////////////////////
    private void logQuery(Query query, SearchCriteria criteria) {
        if (log.isDebugEnabled()) {
            try {
                StringWriter writer = new StringWriter();
                com.fasterxml.jackson.databind.ObjectMapper jackson = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.core.JsonGenerator generator = jackson.createGenerator(writer);
                // Serialize using elastic client's mapper would be ideal; simplified here
                // NOTE: not all Query implementations directly serialize this way; but kept for parity with your code
                // Fallback: just log query.toString()
                writer.write(query.toString());
                generator.close();
                log.debug("Elasticsearch Query for criteria {}: {}", criteria, writer.toString());
            } catch (Exception e) {
                log.warn("Failed to serialize query for logging", e);
            }
        }
    }

    //////////////////////////////
    // Other helper endpoints converted to reactive
    //////////////////////////////

    public Mono<ProductSearchResponse> searchByShop(String shopId, Pageable pageable) {
        return esRepo.findByShopId(shopId)
                .collectList()
                .map(list -> buildPagedResponse(list, pageable, "salesCount", "desc"));
    }

    public Mono<ProductSearchResponse> searchByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return esRepo.findAll()
                .filter(p -> p.getVariants() != null && p.getVariants().stream().anyMatch(v -> {
                    Double priceDouble = v.getBasePrice();
                    BigDecimal price = (priceDouble == null) ? null : BigDecimal.valueOf(priceDouble);
                    if (price == null) return false;
                    if (minPrice != null && price.compareTo(minPrice) < 0) return false;
                    if (maxPrice != null && price.compareTo(maxPrice) > 0) return false;
                    return true;
                }))
                .collectList()
                .map(list -> buildPagedResponse(list, pageable, "salesCount", "desc"));
    }

    public Mono<ProductSearchResponse> searchByMinRating(BigDecimal minRating, Pageable pageable) {
        return esRepo.findAll()
                .filter(p -> p.getAverageRating() != null &&
                        BigDecimal.valueOf(p.getAverageRating()).compareTo(minRating) >= 0)
                .collectList()
                .map(list -> buildPagedResponse(list, pageable, "averageRating", "desc"));
    }

    public Mono<ProductSearchResponse> searchInStockProducts(Pageable pageable) {
        return esRepo.findAll()
                .filter(p -> p.getVariants() != null && p.getVariants().stream()
                        .anyMatch(v -> v.getQuantityOnHand() != null && v.getQuantityOnHand() > 0))
                .collectList()
                .map(list -> buildPagedResponse(list, pageable, "salesCount", "desc"));
    }

    public Flux<String> getSearchSuggestions(String prefix, int limit) {
        if (prefix == null || prefix.isBlank()) {
            return Flux.empty();
        }
        String p = prefix.toLowerCase(Locale.ROOT);
        return esRepo.findByNameContainingIgnoreCase(prefix)
                .map(ProductDocument::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .filter(s -> s.toLowerCase(Locale.ROOT).startsWith(p))
                .take(limit);
    }


    public Mono<SearchFilters> getSearchFilters() {
        return esRepo.findAll()
                .collectList()
                .map(docs -> {
                    Set<String> categories = docs.stream()
                            .map(ProductDocument::getCategoryName)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toCollection(LinkedHashSet::new));

                    Set<String> shops = docs.stream()
                            .map(ProductDocument::getShopName)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toCollection(LinkedHashSet::new));

                    Set<String> colors = docs.stream()
                            .flatMap(d -> d.getVariants() == null ? java.util.stream.Stream.<ProductVariantDocument>empty()
                                    : d.getVariants().stream())
                            .map(ProductVariantDocument::getColor)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toCollection(LinkedHashSet::new));

                    Set<String> sizes = docs.stream()
                            .flatMap(d -> d.getVariants() == null ? java.util.stream.Stream.<ProductVariantDocument>empty()
                                    : d.getVariants().stream())
                            .map(ProductVariantDocument::getSize)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toCollection(LinkedHashSet::new));

                    BigDecimal minPrice = null;
                    BigDecimal maxPrice = null;
                    BigDecimal minRating = null;
                    BigDecimal maxRating = null;

                    for (ProductDocument d : docs) {
                        if (d.getAverageRating() != null) {
                            BigDecimal avgRating = BigDecimal.valueOf(d.getAverageRating());
                            if (minRating == null || avgRating.compareTo(minRating) < 0) minRating = avgRating;
                            if (maxRating == null || avgRating.compareTo(maxRating) > 0) maxRating = avgRating;
                        }

                        if (d.getVariants() != null) {
                            for (var v : d.getVariants()) {
                                Double priceDouble = v.getBasePrice();
                                BigDecimal price = (priceDouble == null) ? null : BigDecimal.valueOf(priceDouble);
                                if (price == null) continue;
                                if (minPrice == null || price.compareTo(minPrice) < 0) minPrice = price;
                                if (maxPrice == null || price.compareTo(maxPrice) > 0) maxPrice = price;
                            }
                        }
                    }

                    SearchFilters.PriceRange pr = SearchFilters.PriceRange.builder().min(minPrice).max(maxPrice).build();
                    SearchFilters.RatingRange rr = SearchFilters.RatingRange.builder().min(minRating).max(maxRating).build();

                    return SearchFilters.builder()
                            .categories(new ArrayList<>(categories))
                            .shops(new ArrayList<>(shops))
                            .colors(new ArrayList<>(colors))
                            .sizes(new ArrayList<>(sizes))
                            .priceRange(pr)
                            .ratingRange(rr)
                            .build();
                });
    }

    private ProductSearchResponse buildPagedResponse(List<ProductDocument> docs, Pageable pageable, String sortBy, String sortDir) {
        int totalElements = docs.size();
        int pageSize = pageable.getPageSize();
        int currentPage = pageable.getPageNumber();
        int start = (int) pageable.getOffset();
        if (start > totalElements) start = totalElements;
        int end = Math.min(start + pageSize, totalElements);

        List<ProductDocument> pageList = docs.subList(start, end);
        List<ProductDTO> dtos = pageList.stream()
                .map(productMapper::toDtoFromDocument)
                .collect(Collectors.toList());

        int totalPages = pageSize == 0 ? 0 : (int) Math.ceil((double) totalElements / pageSize);

        ProductSearchResponse resp = new ProductSearchResponse();
        resp.setProducts(dtos);
        resp.setTotalElements(totalElements);
        resp.setTotalPages(totalPages);
        resp.setCurrentPage(currentPage);
        resp.setPageSize(pageSize);
        resp.setSortBy(sortBy);
        resp.setSortDirection(sortDir);
        resp.setAggregations(Collections.emptyMap());

        return resp;
    }

    public Mono<ProductSearchResponse> getBestSellers(Pageable pageable) {
        return esRepo.findAll()
                .sort((a, b) -> Long.compare(b.getSalesCount(), a.getSalesCount()))
                .collectList()
                .map(list -> buildPagedResponse(list, pageable, "salesCount", "desc"));
    }

    public Mono<ProductSearchResponse> getDiscountedProducts(Pageable pageable) {
        return esRepo.findAll()
                .filter(p -> p.getVariants() != null && p.getVariants().stream()
                        .anyMatch(v -> v.getSalePrice() != null
                                && v.getBasePrice() != null
                                && v.getSalePrice().compareTo(v.getBasePrice()) < 0))
                .collectList()
                .map(list -> buildPagedResponse(list, pageable, "salePrice", "asc"));
    }
}
