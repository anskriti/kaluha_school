"use client";

import { useState, useEffect, useCallback } from "react";
import { pocketbaseService, QueryOptions } from "@/services/pocketbaseService";
import { handleApiCall } from "@/lib/api";

/**
 * Custom hook for querying collections with pagination, filtering, sorting, and search.
 */
export function usePocketBaseQuery<T>(
  collectionName: string,
  initialOptions: QueryOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialOptions.page || 1);
  const [perPage, setPerPage] = useState<number>(initialOptions.perPage || 10);
  const [filter, setFilter] = useState<string | undefined>(initialOptions.filter);
  const [sort, setSort] = useState<string | undefined>(initialOptions.sort);
  const [search, setSearch] = useState<string>("");
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (search && searchFields.length > 0) {
        result = await pocketbaseService.searchRecords<T>(
          collectionName,
          search,
          searchFields,
          {
            page,
            perPage,
            sort,
            expand: initialOptions.expand,
            fields: initialOptions.fields,
          }
        );
      } else {
        result = await pocketbaseService.getRecords<T>(collectionName, {
          page,
          perPage,
          filter,
          sort,
          expand: initialOptions.expand,
          fields: initialOptions.fields,
        });
      }

      setData(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error(`Error querying collection ${collectionName}:`, err);
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [collectionName, page, perPage, filter, sort, search, searchFields, initialOptions.expand, initialOptions.fields]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runSearch = (term: string, fields: string[]) => {
    setSearch(term);
    setSearchFields(fields);
    setPage(1); // Reset page to first on new search
  };

  return {
    data,
    loading,
    error,
    page,
    perPage,
    totalItems,
    totalPages,
    setPage,
    setPerPage,
    setFilter,
    setSort,
    runSearch,
    refetch: fetchData,
  };
}

/**
 * Custom hook for single-record CRUD operations with loading and error states.
 */
export function usePocketBaseCrud<T>(collectionName: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createRecord = async (data: any): Promise<T | null> => {
    setLoading(true);
    setError(null);
    const res = await handleApiCall<T>(
      pocketbaseService.createRecord<T>(collectionName, data)
    );
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to create record.");
      return null;
    }
    return res.data || null;
  };

  const getRecord = async (id: string, options: { expand?: string; fields?: string } = {}): Promise<T | null> => {
    setLoading(true);
    setError(null);
    const res = await handleApiCall<T>(
      pocketbaseService.getRecordById<T>(collectionName, id, options)
    );
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to fetch record.");
      return null;
    }
    return res.data || null;
  };

  const updateRecord = async (id: string, data: any): Promise<T | null> => {
    setLoading(true);
    setError(null);
    const res = await handleApiCall<T>(
      pocketbaseService.updateRecord<T>(collectionName, id, data)
    );
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to update record.");
      return null;
    }
    return res.data || null;
  };

  const deleteRecord = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const res = await handleApiCall<boolean>(
      pocketbaseService.deleteRecord(collectionName, id)
    );
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to delete record.");
      return false;
    }
    return true;
  };

  const uploadFile = async (
    recordId: string,
    fieldName: string,
    file: File | Blob,
    fileName?: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    const res = await handleApiCall<T>(
      pocketbaseService.uploadFile<T>(collectionName, recordId, fieldName, file, fileName)
    );
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to upload file.");
      return null;
    }
    return res.data || null;
  };

  return {
    loading,
    error,
    createRecord,
    getRecord,
    updateRecord,
    deleteRecord,
    uploadFile,
  };
}
