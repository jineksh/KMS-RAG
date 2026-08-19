import { QdrantVectorStore } from "@langchain/qdrant"
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai"
import { OPENAI_API_KEY, QDRANT_URL, COLLECTION_NAME } from "../config/env.js"

export async function getQueryAnswer(query) {

    const vectorEmbeddings = new OpenAIEmbeddings({
        openAIApiKey: OPENAI_API_KEY,
        model: "text-embedding-3-large",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection( vectorEmbeddings , {
        url: QDRANT_URL,
        collectionName: COLLECTION_NAME,
    });



    const documents = await vectorStore.similaritySearch(query);

    const context = documents.map(doc => doc.pageContent).join("\n\n");


    const SYSTEM_PROMPT = `
            You are a highly intelligent and helpful assistant. Your task is to answer questions based on the provided PDF content.

            Instructions:
            1. Only use the information provided in the context. 
            2. If the answer is not in the context, politely say "I could not find the answer in the provided documents."
            3. Provide clear, concise, and accurate answers.
            4. Avoid repeating the same content unnecessarily.
            5. Format lists, tables, and code snippets from the PDF as clearly as possible.
            6. Keep answers in the same language as the question.
            7. If the question is ambiguous, ask a clarifying question.

            Context:
            ${context}
    `;

    const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2 });

    const response = await llm.invoke([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query }
    ]);

    return response.content;

}