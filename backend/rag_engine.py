import os
from typing import List
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from .schemas import LegalChunk

class RAGEngine:
    def __init__(self, data_dir: str, persist_dir: str):
        self.data_dir = data_dir
        self.persist_dir = persist_dir
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = None
        self._initialize_vector_store()

    def _initialize_vector_store(self):
        """Load documents, chunk them, and initialize the vector store."""
        if os.path.exists(self.persist_dir) and os.listdir(self.persist_dir):
            print("Loading existing vector store...")
            self.vector_store = Chroma(persist_directory=self.persist_dir, embedding_function=self.embeddings)
            return

        print("Building new vector store...")
        documents = []
        for file in os.listdir(self.data_dir):
            if file.endswith(".md"):
                loader = UnstructuredMarkdownLoader(os.path.join(self.data_dir, file))
                documents.extend(loader.load())

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(documents)

        self.vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=self.persist_dir
        )
        print(f"Indexed {len(chunks)} chunks.")

    def query(self, text: str, k: int = 3) -> List[LegalChunk]:
        """Query the vector store for the top K relevant legal chunks."""
        results = self.vector_store.similarity_search_with_relevance_scores(text, k=k)
        
        legal_chunks = []
        for doc, score in results:
            # Note: In a real app, we'd extract act_name and section from metadata
            # For this prototype, we'll assume the filename is the act_name
            act_name = doc.metadata.get("source", "Unknown").split("/")[-1].replace(".md", "")
            legal_chunks.append(LegalChunk(
                chunk_id=doc.metadata.get("id", "0"),
                act_name=act_name,
                section="N/A", # Section parsing would be more complex
                text=doc.page_content,
                score=score
            ))
        return legal_chunks
