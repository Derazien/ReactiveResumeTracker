import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";

export interface EmbeddingResult {
  embedding: number[];
  hash: string;
  model: string;
  inputText: string;
}

export interface SimilarityResult {
  similarity: number;
  distance: number;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly cohereApiKey: string;
  private readonly cohereModel: string;

  constructor(private readonly configService: ConfigService) {
    this.cohereApiKey = this.configService.get<string>("COHERE_API_KEY") || 
                       this.configService.get<string>("CO_API_KEY") || "";
    this.cohereModel = this.configService.get<string>("COHERE_MODEL") || "embed-english-v3.0";
    
    if (!this.cohereApiKey) {
      this.logger.warn("No Cohere API key found. Embedding functionality will be disabled.");
    }
  }

  /**
   * Generate embeddings for text using Cohere API
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.cohereApiKey) {
      throw new Error("Cohere API key not configured");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Input text cannot be empty");
    }

    const inputText = text.trim();
    const hash = this.generateHash(inputText);

    try {
      this.logger.debug(`Generating embedding for text: ${inputText.substring(0, 100)}...`);

      const response = await fetch("https://api.cohere.ai/v1/embed", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.cohereApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts: [inputText],
          model: this.cohereModel,
          input_type: "search_document",
          truncate: "END",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cohere API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
        throw new Error("Invalid response from Cohere API: missing embeddings");
      }

      const embedding = data.embeddings[0];
      
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Invalid embedding format from Cohere API");
      }

      this.logger.debug(`Generated embedding with ${embedding.length} dimensions`);

      return {
        embedding,
        hash,
        model: this.cohereModel,
        inputText,
      };
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (!this.cohereApiKey) {
      throw new Error("Cohere API key not configured");
    }

    if (!texts || texts.length === 0) {
      throw new Error("Input texts cannot be empty");
    }

    const validTexts = texts.filter(text => text && text.trim().length > 0);
    if (validTexts.length === 0) {
      throw new Error("No valid input texts provided");
    }

    // Cohere API has a limit of 96 texts per request
    const batchSize = 96;
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < validTexts.length; i += batchSize) {
      const batch = validTexts.slice(i, i + batchSize);
      
      try {
        this.logger.debug(`Generating embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validTexts.length / batchSize)} (${batch.length} texts)`);

        const response = await fetch("https://api.cohere.ai/v1/embed", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.cohereApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texts: batch,
            model: this.cohereModel,
            input_type: "search_document",
            truncate: "END",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Cohere API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (!data.embeddings || !Array.isArray(data.embeddings)) {
          throw new Error("Invalid response from Cohere API: missing embeddings");
        }

        // Process each embedding in the batch
        for (let j = 0; j < batch.length; j++) {
          const text = batch[j];
          const embedding = data.embeddings[j];
          
          if (!Array.isArray(embedding) || embedding.length === 0) {
            this.logger.warn(`Invalid embedding for text: ${text.substring(0, 50)}...`);
            continue;
          }

          results.push({
            embedding,
            hash: this.generateHash(text),
            model: this.cohereModel,
            inputText: text,
          });
        }

        // Rate limiting: wait 1 second between batches
        if (i + batchSize < validTexts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        this.logger.error(`Failed to generate embeddings for batch starting at index ${i}: ${error instanceof Error ? error.message : "Unknown error"}`);
        throw error;
      }
    }

    this.logger.debug(`Generated ${results.length} embeddings in total`);
    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): SimilarityResult {
    if (!embedding1 || !embedding2) {
      throw new Error("Both embeddings are required");
    }

    if (embedding1.length !== embedding2.length) {
      throw new Error(`Embedding dimensions don't match: ${embedding1.length} vs ${embedding2.length}`);
    }

    if (embedding1.length === 0) {
      throw new Error("Embeddings cannot be empty");
    }

    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
    }

    // Calculate magnitudes
    let magnitude1 = 0;
    let magnitude2 = 0;
    for (let i = 0; i < embedding1.length; i++) {
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return { similarity: 0, distance: 1 };
    }

    const similarity = dotProduct / (magnitude1 * magnitude2);
    const distance = 1 - similarity;

    return {
      similarity: Math.max(-1, Math.min(1, similarity)), // Clamp to [-1, 1]
      distance: Math.max(0, Math.min(2, distance)), // Clamp to [0, 2]
    };
  }

  /**
   * Find most similar embeddings from a collection
   */
  findMostSimilar(
    queryEmbedding: number[],
    candidateEmbeddings: { id: string; embedding: number[]; metadata?: any }[],
    topK: number = 10,
    minSimilarity: number = 0.0
  ): Array<{ id: string; similarity: number; distance: number; metadata?: any }> {
    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error("Query embedding is required");
    }

    if (!candidateEmbeddings || candidateEmbeddings.length === 0) {
      return [];
    }

    const results: Array<{ id: string; similarity: number; distance: number; metadata?: any }> = [];

    for (const candidate of candidateEmbeddings) {
      try {
        const { similarity, distance } = this.calculateCosineSimilarity(queryEmbedding, candidate.embedding);
        
        if (similarity >= minSimilarity) {
          results.push({
            id: candidate.id,
            similarity,
            distance,
            metadata: candidate.metadata,
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to calculate similarity for candidate ${candidate.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Sort by similarity (descending) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Generate a hash for caching embeddings
   */
  generateHash(text: string): string {
    return createHash("sha256")
      .update(text.toLowerCase().trim())
      .digest("hex");
  }

  /**
   * Parse embedding from database string format
   */
  parseEmbedding(embeddingStr: string): number[] {
    if (!embeddingStr) {
      throw new Error("Embedding string is required");
    }

    try {
      const parsed = JSON.parse(embeddingStr);
      if (!Array.isArray(parsed)) {
        throw new Error("Embedding must be an array");
      }
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Serialize embedding for database storage
   */
  serializeEmbedding(embedding: number[]): string {
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Embedding must be a non-empty array");
    }
    return JSON.stringify(embedding);
  }

  /**
   * Check if embeddings are cached (same hash)
   */
  isEmbeddingCached(text: string, storedHash: string): boolean {
    const currentHash = this.generateHash(text);
    return currentHash === storedHash;
  }

  /**
   * Get service status and configuration
   */
  getStatus(): { available: boolean; model: string; apiKeyConfigured: boolean } {
    return {
      available: !!this.cohereApiKey,
      model: this.cohereModel,
      apiKeyConfigured: !!this.cohereApiKey,
    };
  }
} 