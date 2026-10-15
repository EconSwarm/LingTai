"""The agent loop (:mod:`lingtai.agent.core`) and the hold registry
(:mod:`lingtai.agent.holds`). ``core`` pulls in the Sentinel and the tools, and the tools
import ``holds``; so ``core`` is loaded on first use rather than here, and
``from lingtai.agent.holds import Holds`` works from anywhere without a cycle."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from lingtai.agent.core import Incoming, MuseAgent

__all__ = ["Incoming", "MuseAgent"]


def __getattr__(name: str) -> Any:
    if name in __all__:
        from lingtai.agent import core

        return getattr(core, name)
    raise AttributeError(f"module 'lingtai.agent' has no attribute {name!r}")
