"""
═══════════════════════════════════════════════════════════════════════════════
GEMINI MODEL PROVIDER - GOOGLE AI INTEGRATION
═══════════════════════════════════════════════════════════════════════════════

Integrates Google's Gemini models as an alternative to Claude/ChatGPT.
Supports Gemini 1.5 Pro, Gemini 2.0 Flash, and other Google AI models.

Usage:
    from dnalang_sdk import DNALangCopilotClient
    
    client = DNALangCopilotClient(use_gemini=True, gemini_api_key="your-key")
    response = await client.gemini_infer("What is quantum computing?")
"""

import asyncio
import json
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, AsyncIterator
from datetime import datetime


@dataclass
class GeminiMessage:
    """Gemini message format"""
    role: str  # "user" or "model"
    content: str
    timestamp: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "role": self.role,
            "parts": [{"text": self.content}]
        }


@dataclass
class GeminiConfig:
    """Configuration for Gemini models"""
    model: str = "gemini-2.0-flash-exp"  # or gemini-1.5-pro
    api_key: Optional[str] = None
    temperature: float = 0.7
    max_output_tokens: int = 8192
    top_p: float = 0.95
    top_k: int = 40
    safety_settings: List[Dict[str, str]] = field(default_factory=lambda: [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ])


class GeminiModelProvider:
    """
    Google Gemini model provider for DNALang SDK.
    
    Provides access to Gemini models with consciousness field tracking
    and lambda-phi conservation awareness.
    """
    
    def __init__(
        self,
        config: Optional[GeminiConfig] = None,
        api_key: Optional[str] = None
    ):
        self.config = config or GeminiConfig(api_key=api_key)
        if api_key and not self.config.api_key:
            self.config.api_key = api_key
        
        self.conversation_history: List[GeminiMessage] = []
        self.session_stats = {
            "total_tokens": 0,
            "total_requests": 0,
            "avg_response_time": 0.0
        }
        
        # Try to import google-generativeai
        self._gemini = None
        try:
            import google.generativeai as genai
            self._gemini = genai
            if self.config.api_key:
                genai.configure(api_key=self.config.api_key)
        except ImportError:
            print("[WARNING] google-generativeai not installed. Install with: pip install google-generativeai")
    
    async def infer(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[List[GeminiMessage]] = None
    ) -> Dict[str, Any]:
        """
        Run inference with Gemini.
        
        Args:
            prompt: User prompt
            system_instruction: Optional system instruction
            context: Optional conversation context
        
        Returns:
            Response dictionary with text and metadata
        """
        if not self._gemini:
            return {
                "response": "[ERROR] Gemini not available. Install: pip install google-generativeai",
                "model": self.config.model,
                "error": "missing_dependency"
            }
        
        if not self.config.api_key:
            return {
                "response": "[ERROR] Gemini API key not configured",
                "model": self.config.model,
                "error": "missing_api_key"
            }
        
        try:
            # Create model
            model = self._gemini.GenerativeModel(
                model_name=self.config.model,
                system_instruction=system_instruction,
                generation_config={
                    "temperature": self.config.temperature,
                    "top_p": self.config.top_p,
                    "top_k": self.config.top_k,
                    "max_output_tokens": self.config.max_output_tokens,
                },
                safety_settings=self.config.safety_settings
            )
            
            # Build chat history
            history = []
            if context:
                for msg in context:
                    history.append(msg.to_dict())
            
            # Start chat
            start_time = datetime.now()
            chat = model.start_chat(history=history)
            
            # Send message
            response = await asyncio.to_thread(chat.send_message, prompt)
            
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()
            
            # Extract response
            response_text = response.text
            
            # Update session stats
            self.session_stats["total_requests"] += 1
            self.session_stats["total_tokens"] += len(prompt.split()) + len(response_text.split())
            self.session_stats["avg_response_time"] = (
                (self.session_stats["avg_response_time"] * (self.session_stats["total_requests"] - 1) + response_time)
                / self.session_stats["total_requests"]
            )
            
            # Add to conversation history
            self.conversation_history.append(GeminiMessage(role="user", content=prompt, timestamp=start_time))
            self.conversation_history.append(GeminiMessage(role="model", content=response_text, timestamp=end_time))
            
            return {
                "response": response_text,
                "model": self.config.model,
                "response_time": response_time,
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(response_text.split()),
                "finish_reason": response.candidates[0].finish_reason.name if response.candidates else "STOP",
                "safety_ratings": [
                    {"category": r.category.name, "probability": r.probability.name}
                    for r in response.candidates[0].safety_ratings
                ] if response.candidates else []
            }
            
        except Exception as e:
            return {
                "response": f"[ERROR] Gemini inference failed: {str(e)}",
                "model": self.config.model,
                "error": str(e)
            }
    
    async def stream_infer(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[List[GeminiMessage]] = None
    ) -> AsyncIterator[str]:
        """
        Stream inference with Gemini.
        
        Args:
            prompt: User prompt
            system_instruction: Optional system instruction
            context: Optional conversation context
        
        Yields:
            Text chunks as they arrive
        """
        if not self._gemini or not self.config.api_key:
            yield "[ERROR] Gemini not available or API key missing"
            return
        
        try:
            # Create model
            model = self._gemini.GenerativeModel(
                model_name=self.config.model,
                system_instruction=system_instruction,
                generation_config={
                    "temperature": self.config.temperature,
                    "top_p": self.config.top_p,
                    "top_k": self.config.top_k,
                    "max_output_tokens": self.config.max_output_tokens,
                },
                safety_settings=self.config.safety_settings
            )
            
            # Build chat history
            history = []
            if context:
                for msg in context:
                    history.append(msg.to_dict())
            
            # Start chat
            chat = model.start_chat(history=history)
            
            # Stream response
            full_response = []
            async for chunk in asyncio.to_thread(chat.send_message, prompt, stream=True):
                if chunk.text:
                    full_response.append(chunk.text)
                    yield chunk.text
            
            # Update conversation history
            self.conversation_history.append(GeminiMessage(role="user", content=prompt))
            self.conversation_history.append(GeminiMessage(role="model", content="".join(full_response)))
            
        except Exception as e:
            yield f"[ERROR] {str(e)}"
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get session statistics"""
        return {
            **self.session_stats,
            "conversation_length": len(self.conversation_history),
            "model": self.config.model
        }
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history.clear()


class CopilotGeminiAdapter:
    """
    Adapter between GitHub Copilot message format and Gemini format.
    """
    
    def __init__(self, provider: GeminiModelProvider):
        self.provider = provider
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Copilot-compatible chat completion.
        
        Args:
            messages: List of {"role": "user/assistant", "content": "..."}
            stream: Whether to stream response
        
        Returns:
            Completion response in Copilot format
        """
        # Extract system message and convert to Gemini format
        system_instruction = None
        context = []
        
        for msg in messages[:-1]:  # All except last
            role = msg["role"]
            content = msg["content"]
            
            if role == "system":
                system_instruction = content
            elif role == "user":
                context.append(GeminiMessage(role="user", content=content))
            elif role == "assistant":
                context.append(GeminiMessage(role="model", content=content))
        
        # Last message is the prompt
        prompt = messages[-1]["content"]
        
        if stream:
            # Return streaming response
            async def stream_generator():
                async for chunk in self.provider.stream_infer(prompt, system_instruction, context):
                    yield {
                        "choices": [{
                            "delta": {"content": chunk},
                            "index": 0
                        }]
                    }
            
            return stream_generator()
        else:
            # Regular response
            result = await self.provider.infer(prompt, system_instruction, context)
            
            return {
                "id": f"gemini-{datetime.now().timestamp()}",
                "object": "chat.completion",
                "created": int(datetime.now().timestamp()),
                "model": self.provider.config.model,
                "choices": [{
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": result.get("response", "")
                    },
                    "finish_reason": result.get("finish_reason", "stop").lower()
                }],
                "usage": {
                    "prompt_tokens": result.get("prompt_tokens", 0),
                    "completion_tokens": result.get("completion_tokens", 0),
                    "total_tokens": result.get("prompt_tokens", 0) + result.get("completion_tokens", 0)
                }
            }


# ═══════════════════════════════════════════════════════════════════════════════
# CONVENIENCE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

async def gemini_infer_simple(prompt: str, api_key: str) -> str:
    """Quick inference with Gemini"""
    provider = GeminiModelProvider(api_key=api_key)
    result = await provider.infer(prompt)
    return result.get("response", "")
