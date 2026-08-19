import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { QdrantVectorStore } from "@langchain/qdrant"
import { OpenAIEmbeddings } from "@langchain/openai"
import { COLLECTION_NAME } from '../config/env.js'



const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const QDRANT_URL = process.env.QDRANT_URL;

console.log(OPENAI_API_KEY)

export async function indexingPhase(filePath) {

    // Input validations
    if (!filePath || typeof filePath !== "string" || !filePath.trim()) {
        throw new Error("A valid file path is required to index a document.")
    }

    if (!OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY environment variable.")
    }

    if (!QDRANT_URL) {
        throw new Error("Missing QDRANT_URL environment variable.")
    }

    try {

        // Step 1 — Load
        const loader = new PDFLoader(filePath)
        const docs = await loader.load()

        if (!docs || docs.length === 0) {
            throw new Error("No content found in the document.")
        }
        console.log(`Pages loaded: ${docs.length}`)

        // Step 2 — Chunk
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })
        const chunks = await textSplitter.splitDocuments(docs)

        if (!chunks || chunks.length === 0) {
            throw new Error("No chunks created from the document.")
        }
        console.log(`Chunks created: ${chunks.length}`)

        // Step 3 — Metadata
        const chunkWithMetadata = chunks.map((chunk, index) => ({
            ...chunk,
            metadata: {
                chunkIndex: index,
                source: filePath,
                page: chunk.metadata?.loc?.pageNumber ?? index,
            },
        }))

        // Step 4 — Embeddings
        const vectorEmbeddings = new OpenAIEmbeddings({
            openAIApiKey: OPENAI_API_KEY,
            model: "text-embedding-3-large",
        })

        // Step 5 — Store in Qdrant
        const vectorStore = await QdrantVectorStore.fromDocuments(
            chunkWithMetadata,
            vectorEmbeddings,
            {
                url: QDRANT_URL,
                collectionName: COLLECTION_NAME,
            }
        )

        console.log("Indexing done!")

        return {
            collectionName: COLLECTION_NAME,
            totalChunks: chunkWithMetadata.length,
            source: filePath,
            vectorStore,
        }

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown indexing error"
        console.error("Error indexing document:", {
            filePath,
            message,
            code: error?.code,
            cause: error?.cause,
        })
        throw error
    }
}