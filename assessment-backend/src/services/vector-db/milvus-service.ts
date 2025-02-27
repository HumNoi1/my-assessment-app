// src/services/vector-db/milvus-service.ts
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

export class MilvusService {
  private client: MilvusClient;
  
  constructor() {
    this.client = new MilvusClient({
      address: process.env.MILVUS_ADDRESS!,
      username: process.env.MILVUS_USERNAME,
      password: process.env.MILVUS_PASSWORD,
    });
  }
  
  async search(
    collectionName: string,
    vector: number[],
    limit: number = 5
  ) {
    // Search for similar vectors in the collection
    const res = await this.client.search({
      collection_name: collectionName,
      vector: vector,
      limit: limit,
      output_fields: ['content_chunk', 'metadata'],
    });
    
    return res.results;
  }
  
  async insert(
    collectionName: string,
    vectors: number[][],
    fields: Record<string, any>[]
  ) {
    // Insert vectors and their associated data into Milvus
    const res = await this.client.insert({
      collection_name: collectionName,
      fields_data: fields,
      vectors: vectors,
    });
    
    return res;
  }
  
  // Other methods for working with Milvus...
}