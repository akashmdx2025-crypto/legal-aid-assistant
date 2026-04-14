import os
from typing import List
import chromadb
from .schemas import LegalChunk

class RAGEngine:
    def __init__(self, data_dir: str, persist_dir: str):
        self.data_dir = data_dir
        self.persist_dir = persist_dir
        self.client = chromadb.Client()  # In-memory for free tier
        self.collection = None
        self._initialize_vector_store()

    def _initialize_vector_store(self):
        """Load documents, chunk them, and initialize the vector store."""
        self.collection = self.client.get_or_create_collection(
            name="legal_docs",
            metadata={"hnsw:space": "cosine"}
        )

        # If already indexed, skip
        if self.collection.count() > 0:
            print(f"Vector store already has {self.collection.count()} chunks.")
            return

        print("Building new vector store...")
        documents = []
        metadatas = []
        ids = []
        chunk_id = 0

        for file in os.listdir(self.data_dir):
            if file.endswith(".md"):
                filepath = os.path.join(self.data_dir, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                act_name = file.replace(".md", "")
                # Split into chunks of ~500 characters
                chunks = self._split_text(content, chunk_size=500, overlap=50)

                for chunk_text in chunks:
                    documents.append(chunk_text)
                    metadatas.append({"source": file, "act_name": act_name})
                    ids.append(f"chunk_{chunk_id}")
                    chunk_id += 1

        # ChromaDB uses its own built-in embeddings (no torch needed!)
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids,
        )
        print(f"Indexed {len(documents)} chunks.")

    def _split_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Simple text splitter."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start = end - overlap
        return chunks

    def query(self, text: str, k: int = 3) -> List[LegalChunk]:
        """Query the vector store for the top K relevant legal chunks."""
        results = self.collection.query(
            query_texts=[text],
            n_results=k,
        )

        legal_chunks = []
        for i in range(len(results["documents"][0])):
            act_name = results["metadatas"][0][i].get("act_name", "Unknown")
            distance = results["distances"][0][i] if results.get("distances") else 0
            score = max(0, 1 - distance)  # Convert distance to similarity score

            legal_chunks.append(LegalChunk(
                chunk_id=results["ids"][0][i],
                act_name=act_name,
                section="N/A",
                text=results["documents"][0][i],
                score=score
            ))
        return legal_chunks
