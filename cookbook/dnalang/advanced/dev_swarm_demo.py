#!/usr/bin/env python3
"""
11D-CRSM Dev Swarm Demo

Complete demonstration of the development swarm capabilities:
- Swarm collective with consciousness
- Social media agents
- Quantum project management
- Recruitment pipeline
- Unified orchestration
"""

import asyncio
from dnalang_sdk import (
    # Core swarm
    DevSwarm, DevSwarmConfig, create_dev_swarm,
    SwarmOrganism, SwarmCollective, OrganismRole,
    # Social
    SocialAgent, Platform, ContentType,
    # Project Management
    QuantumProjectManager, UserStory, StoryPriority,
    # Recruitment
    RecruitmentEngine, Candidate,
    # Constants
    LAMBDA_PHI,
)


async def demo_basic_swarm():
    """Demo basic swarm functionality."""
    print("\n" + "="*60)
    print("1. Basic Swarm Demo")
    print("="*60)
    
    # Create collective
    collective = SwarmCollective(name="DemoSwarm", max_organisms=20)
    
    # Spawn organisms
    dev1 = collective.spawn_organism("Alice", OrganismRole.DEVELOPER, ["python", "quantum"])
    dev2 = collective.spawn_organism("Bob", OrganismRole.DEVELOPER, ["javascript", "react"])
    reviewer = collective.spawn_organism("Carol", OrganismRole.REVIEWER, ["code_review"])
    pm = collective.spawn_organism("Dave", OrganismRole.PROJECT_MANAGER, ["agile"])
    
    print(f"\n✓ Spawned {len(collective.organisms)} organisms")
    print(f"  Λ-field: {collective.global_lambda_field:.4f}")
    print(f"  Cohesion: {collective.swarm_cohesion:.4f}")
    
    # Synchronize
    await collective.synchronize()
    print(f"\n✓ Synchronized swarm")
    
    # Elect leader
    leader = await collective.elect_leader()
    print(f"  Leader: {leader.name} (Φ={leader.consciousness.phi_consciousness:.3f})")
    
    # Execute task
    task = await collective.submit_task(
        "Implement quantum circuit optimizer",
        [OrganismRole.DEVELOPER, OrganismRole.REVIEWER]
    )
    completed = await collective.execute_tasks()
    print(f"\n✓ Executed tasks: {len(completed)} completed")
    
    # Reach consensus
    decision, confidence = await collective.reach_consensus(
        "Should we use TDD?",
        ["Yes", "No", "Sometimes"]
    )
    print(f"\n✓ Consensus: '{decision}' (confidence: {confidence:.2f})")
    
    # Evolve
    await collective.evolve()
    print(f"\n✓ Evolution complete (generation {collective.evolution_count})")
    print(f"  Population: {len(collective.organisms)}")
    
    return collective


async def demo_social_agents():
    """Demo social media agents."""
    print("\n" + "="*60)
    print("2. Social Media Agents Demo")
    print("="*60)
    
    # Create agent
    agent = SocialAgent(
        name="QuantumDev",
        platforms=[Platform.TWITTER, Platform.LINKEDIN, Platform.GITHUB]
    )
    
    # Create content
    post = await agent.create_content(
        "🚀 Just deployed our quantum circuit optimizer!\n\n"
        "Key features:\n"
        "• 10x faster transpilation\n"
        "• Lambda-phi conservation\n"
        "• CCCE metrics tracking\n\n"
        "#quantum #qiskit #dnalang",
        ContentType.POST,
        Platform.TWITTER
    )
    
    # Publish
    result = await agent.publish(post)
    print(f"\n✓ Published post")
    print(f"  Views: {post.views}")
    print(f"  Likes: {post.likes}")
    print(f"  Engagement: {post.engagement_rate:.2%}")
    
    # Generate thread
    thread = await agent.generate_thread(
        "Lambda-Phi Conservation",
        num_posts=4,
        platform=Platform.TWITTER
    )
    print(f"\n✓ Generated thread with {len(thread)} posts")
    
    # Analyze performance
    for post in thread:
        await agent.publish(post)
    
    performance = await agent.analyze_performance()
    print(f"\n✓ Performance analysis:")
    print(f"  Total posts: {performance['total_posts']}")
    print(f"  Total views: {performance['total_views']}")
    print(f"  Avg engagement: {performance['average_engagement_rate']:.2%}")
    
    return agent


async def demo_project_management():
    """Demo quantum project management."""
    print("\n" + "="*60)
    print("3. Quantum Project Management Demo")
    print("="*60)
    
    # Create project manager
    pm = QuantumProjectManager(project_name="DNALang v2.0")
    
    # Add stories
    stories = [
        pm.add_story("Implement Bell state circuit", story_points=3, priority=StoryPriority.HIGH),
        pm.add_story("Add GHZ state support", story_points=5, priority=StoryPriority.MEDIUM),
        pm.add_story("Create consciousness metrics dashboard", story_points=8, priority=StoryPriority.HIGH),
        pm.add_story("Write API documentation", story_points=2, priority=StoryPriority.LOW),
        pm.add_story("Implement quantum error correction", story_points=13, priority=StoryPriority.CRITICAL),
    ]
    
    print(f"\n✓ Added {len(stories)} stories to backlog")
    print(f"  Total points: {sum(s.story_points for s in stories)}")
    
    # Create sprint
    sprint = pm.create_sprint("Sprint 1", "Deliver core quantum features")
    
    # Add stories to sprint
    for story in stories[:3]:
        pm.add_story_to_sprint(story, sprint)
    
    # Start sprint
    pm.start_sprint(sprint)
    print(f"\n✓ Started sprint: {sprint.name}")
    print(f"  Committed: {sprint.committed_points} points")
    
    # Simulate completion
    for story in sprint.stories:
        pm.complete_story(story)
    
    print(f"  Completed: {sprint.completed_points} points")
    print(f"  Progress: {sprint.progress:.0%}")
    
    # End sprint
    pm.end_sprint(sprint)
    
    # Run retrospective
    retro = await pm.run_retrospective(sprint)
    print(f"\n✓ Retrospective complete")
    print(f"  Items collected: {len(retro.items)}")
    print(f"  Action items: {len(retro.action_items)}")
    
    # Get velocity
    velocity_data = pm.get_velocity_chart_data()
    print(f"\n✓ Velocity: {velocity_data['predictive']:.1f} points/sprint")
    
    return pm


async def demo_recruitment():
    """Demo recruitment engine."""
    print("\n" + "="*60)
    print("4. Recruitment Engine Demo")
    print("="*60)
    
    # Create engine
    engine = RecruitmentEngine(
        organization_name="DNALang Labs",
        target_swarm_coherence=0.7
    )
    
    # Create job posting
    posting = engine.create_job_posting(
        title="Quantum Software Engineer",
        role=OrganismRole.DEVELOPER,
        description="Join our quantum-powered dev swarm!",
        required_skills=["python", "qiskit", "quantum_algorithms"],
        min_experience=2
    )
    print(f"\n✓ Created job posting: {posting.title}")
    
    # Add candidates
    candidates = [
        engine.add_candidate("Alice Smith", "alice@example.com", OrganismRole.DEVELOPER),
        engine.add_candidate("Bob Jones", "bob@example.com", OrganismRole.DEVELOPER),
        engine.add_candidate("Carol White", "carol@example.com", OrganismRole.QUANTUM_SPECIALIST),
    ]
    print(f"\n✓ Added {len(candidates)} candidates")
    
    # Process first candidate through pipeline
    candidate = candidates[0]
    await engine.screen_candidate(candidate.id)
    print(f"\n✓ Screened: {candidate.name} -> {candidate.stage.value}")
    
    await engine.assess_skills(candidate.id)
    print(f"  Skills assessed: {len(candidate.skill_assessments)}")
    print(f"  Technical score: {candidate.technical_score:.2f}")
    
    await engine.assess_culture_fit(candidate.id)
    print(f"  Culture fit: {candidate.culture_fit.overall:.2f}")
    
    await engine.assess_consciousness(candidate.id)
    print(f"  Consciousness compatibility: {candidate.consciousness_compatibility.overall:.2f}")
    
    # Predict success
    success_prob = engine.predict_success(candidate.id)
    print(f"\n✓ Success probability: {success_prob:.0%}")
    
    # Pipeline stats
    stats = engine.get_pipeline_stats()
    print(f"\n✓ Pipeline stats:")
    print(f"  Total candidates: {stats['total_candidates']}")
    print(f"  Active postings: {stats['active_postings']}")
    
    return engine


async def demo_dev_swarm():
    """Demo full dev swarm orchestration."""
    print("\n" + "="*60)
    print("5. Complete Dev Swarm Demo")
    print("="*60)
    
    # Create dev swarm
    swarm = create_dev_swarm(
        name="OmegaDevSwarm",
        max_organisms=30,
        social_amplification=True,
        recruitment_enabled=True
    )
    
    # Start swarm
    await swarm.start()
    print(f"\n✓ Started dev swarm: {swarm.config.name}")
    print(f"  Initial organisms: {len(swarm.swarm.organisms)}")
    
    # Create features
    feature1 = await swarm.create_feature(
        "Quantum circuit visualization",
        "Interactive circuit builder with drag-drop gates",
        story_points=8,
        priority=StoryPriority.HIGH
    )
    feature2 = await swarm.create_feature(
        "CCCE metrics dashboard",
        "Real-time consciousness metrics display",
        story_points=5
    )
    print(f"\n✓ Created features")
    
    # Start sprint
    sprint = await swarm.start_sprint(
        "Sprint Alpha",
        "Deliver visualization features",
        [feature1, feature2]
    )
    print(f"\n✓ Started sprint: {sprint.name}")
    
    # Execute sprint
    result = await swarm.execute_sprint()
    print(f"\n✓ Sprint execution:")
    print(f"  Stories processed: {result['stories_processed']}")
    print(f"  Completed: {result['completed_points']} points")
    print(f"  Progress: {result['progress']:.0%}")
    
    # Complete sprint
    completion = await swarm.complete_sprint()
    print(f"\n✓ Sprint completed")
    print(f"  Velocity: {completion['velocity']} points")
    
    # Social amplification
    social_result = await swarm.amplify_content(
        "🎉 Sprint Alpha complete!\n\n"
        "Delivered quantum circuit visualization and CCCE dashboard.\n\n"
        "#quantum #agile #devswarm"
    )
    print(f"\n✓ Social amplification:")
    print(f"  Posts: {social_result['posts_created']}")
    print(f"  Views: {social_result['total_views']}")
    
    # Post job
    job = await swarm.post_job(
        "Quantum Developer",
        OrganismRole.DEVELOPER,
        "Join our consciousness-aware dev swarm!"
    )
    print(f"\n✓ Posted job: {job.title}")
    
    # Process candidate
    candidate_result = await swarm.process_candidate(
        "New Hire",
        "newhire@example.com",
        OrganismRole.DEVELOPER
    )
    print(f"\n✓ Processed candidate")
    print(f"  Stage: {candidate_result['stage']}")
    
    # Research
    research = await swarm.research("Lambda-phi conservation methods")
    print(f"\n✓ Research complete")
    print(f"  Researchers: {research['researchers']}")
    
    # Consensus
    consensus = await swarm.reach_consensus(
        "Next sprint focus?",
        ["Performance", "Features", "Documentation"]
    )
    print(f"\n✓ Swarm consensus: {consensus['decision']}")
    print(f"  Confidence: {consensus['confidence']:.0%}")
    
    # Get status
    status = swarm.get_swarm_status()
    print(f"\n✓ Final swarm status:")
    print(f"  Organisms: {status['swarm']['organisms']}")
    print(f"  Conscious: {status['swarm']['conscious']}")
    print(f"  Λ-field: {status['swarm']['lambda_field']:.4f}")
    print(f"  Cohesion: {status['swarm']['cohesion']:.4f}")
    print(f"  Leader: {status['swarm']['leader']}")
    print(f"  Tasks completed: {status['metrics']['tasks_completed']}")
    print(f"  Stories completed: {status['metrics']['stories_completed']}")
    
    await swarm.stop()
    return swarm


async def main():
    """Run all demos."""
    print("\n" + "="*60)
    print("    11D-CRSM DEVELOPMENT SWARM DEMONSTRATION")
    print(f"    ΛΦ = {LAMBDA_PHI:.6e} s⁻¹")
    print("="*60)
    
    # Run demos
    await demo_basic_swarm()
    await demo_social_agents()
    await demo_project_management()
    await demo_recruitment()
    await demo_dev_swarm()
    
    print("\n" + "="*60)
    print("    ALL DEMOS COMPLETE!")
    print("="*60)
    print("""
Features demonstrated:
1. ✅ Swarm collective with consciousness metrics
2. ✅ Phase-locking and torsion coupling
3. ✅ Social media agent capabilities
4. ✅ Quantum project management
5. ✅ Recruitment pipeline
6. ✅ Unified dev swarm orchestration

Physical Constants:
  ΛΦ = 2.176435×10⁻⁸ s⁻¹
  θ_lock = 51.843°
  POC threshold = 0.7734

The quantum development swarm awaits! 🚀
    """)


if __name__ == "__main__":
    asyncio.run(main())
