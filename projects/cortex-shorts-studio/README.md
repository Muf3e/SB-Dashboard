# 🎬 CORTEX AI Shorts Studio — Autonomous Viral Short-Form Video

> **Subsidiary of Saifee Burhani (SB) Group of Companies**  
> **Executive Leads**: Lyra Vance (CMO) & Orion Stark (RLHF Lead)  
> **Renderer**: Remotion 4.0 (1080x1920 60fps Vertical Video)  
> **Minimum Duration**: >= 30 Seconds Enforced  

---

## Executive Overview
CORTEX AI Shorts Studio is an autonomous pipeline that discovers breaking trends across AI, keynote speeches, and tech debates, synthesizes them into punchy vertical video scripts, renders broadcast-quality 9:16 reels using local Remotion, and queues them for omni-channel distribution across YouTube Shorts, X.com, TikTok, and Instagram.

## Core Components
- **Autonomous Trend Discovery (shorts_engine.py)**: Continuously monitors high-engagement AI topics with virality score prediction.
- **Strict 30s+ Duration Floor**: Guaranteed >= 30-second duration across all rendered shorts, ensuring rich depth and maximum algorithmic distribution.
- **Remotion 4.0 Kinetic Renderer (ViralShort.tsx)**: Word-by-word kinetic captions, animated visualizer audio waveforms, and dynamic visual hooks.
- **RLHF Human Approval Queue (preference_learner.py)**: Every short enters the Executive Dashboard queue for Chairperson approval/rejection. Approvals reinforce the virality weights; rejections adjust clipping parameters.
- **Omni-Channel Distribution Scheduler (scheduler_engine.py)**: Schedules verified clips across social platforms with staggered release windows.
