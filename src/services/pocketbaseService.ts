import { pb } from "@/lib/pocketbase";
import PocketBase from "pocketbase";

export interface QueryOptions {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
  fields?: string;
}

export class PocketBaseService {
  private pbClient: PocketBase;

  constructor(customClient?: PocketBase) {
    this.pbClient = customClient || pb;
  }

  /**
   * Create a new record in a collection
   */
  async createRecord<T>(collectionName: string, data: any): Promise<T> {
    // If data is a FormData object (for file upload), let PocketBase handle it directly
    return await this.pbClient.collection(collectionName).create<T>(data);
  }

  /**
   * Read multiple records (supports pagination, filtering, sorting, and search)
   */
  async getRecords<T>(
    collectionName: string,
    options: QueryOptions = {}
  ): Promise<{
    items: T[];
    totalItems: number;
    totalPages: number;
    page: number;
    perPage: number;
  }> {
    const page = options.page || 1;
    const perPage = options.perPage || 50;

    const queryParams: any = {};
    if (options.filter) queryParams.filter = options.filter;
    if (options.sort) queryParams.sort = options.sort;
    if (options.expand) queryParams.expand = options.expand;
    if (options.fields) queryParams.fields = options.fields;

    const resultList = await this.pbClient
      .collection(collectionName)
      .getList<T>(page, perPage, queryParams);

    return {
      items: resultList.items,
      totalItems: resultList.totalItems,
      totalPages: resultList.totalPages,
      page: resultList.page,
      perPage: resultList.perPage,
    };
  }

  /**
   * Read a single record by its ID
   */
  async getRecordById<T>(
    collectionName: string,
    id: string,
    options: { expand?: string; fields?: string } = {}
  ): Promise<T> {
    return await this.pbClient
      .collection(collectionName)
      .getOne<T>(id, options);
  }

  /**
   * Update an existing record by its ID
   */
  async updateRecord<T>(
    collectionName: string,
    id: string,
    data: any
  ): Promise<T> {
    return await this.pbClient
      .collection(collectionName)
      .update<T>(id, data);
  }

  /**
   * Delete a record by its ID
   */
  async deleteRecord(collectionName: string, id: string): Promise<boolean> {
    await this.pbClient.collection(collectionName).delete(id);
    return true;
  }

  /**
   * Helper to upload a file to a record (uses FormData)
   */
  async uploadFile<T>(
    collectionName: string,
    recordId: string,
    fieldName: string,
    file: File | Blob,
    fileName?: string
  ): Promise<T> {
    const formData = new FormData();
    if (fileName) {
      formData.append(fieldName, file, fileName);
    } else {
      formData.append(fieldName, file);
    }

    return await this.pbClient
      .collection(collectionName)
      .update<T>(recordId, formData);
  }

  /**
   * Generates a direct URL for a file stored in PocketBase
   */
  getFileUrl(
    record: { id: string; collectionId: string; collectionName: string; [key: string]: any },
    fileName: string,
    options: { thumb?: string } = {}
  ): string {
    if (!fileName) return "";
    return this.pbClient.files.getUrl(record, fileName, options);
  }

  /**
   * Search records by a general term across specified text fields
   */
  async searchRecords<T>(
    collectionName: string,
    term: string,
    searchFields: string[],
    options: Omit<QueryOptions, "filter"> = {}
  ): Promise<{
    items: T[];
    totalItems: number;
    totalPages: number;
    page: number;
    perPage: number;
  }> {
    if (!term.trim()) {
      return this.getRecords<T>(collectionName, options);
    }

    // Build filter string like (field1 ~ 'term' || field2 ~ 'term')
    const sanitizedTerm = term.replace(/'/g, "\\'");
    const filterString = searchFields
      .map((field) => `${field} ~ '${sanitizedTerm}'`)
      .join(" || ");

    return this.getRecords<T>(collectionName, {
      ...options,
      filter: filterString,
    });
  }
}

// Export a default instance for general client-side use
export const pocketbaseService = new PocketBaseService();
