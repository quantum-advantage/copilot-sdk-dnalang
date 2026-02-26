"""Tests for swarm_organism.py, swarm_collective.py, dev_swarm.py, social_agents.py, recruitment_engine.py."""

import pytest
import asyncio

from dnalang_sdk.swarm_organism import (
    SwarmOrganism,
    OrganismRole,
    OrganismState,
    ConsciousnessMetrics,
    PhaseState,
    Skill,
    SkillLevel,
    Gene,
    Memory,
    SocialConnection,
    LAMBDA_PHI,
    THETA_LOCK,
    POC_THRESHOLD,
    DIMENSIONS_11D,
)
from dnalang_sdk.swarm_collective import (
    SwarmCollective,
    SwarmState,
    SwarmTask,
    SwarmMetrics,
    NeurobusChannel,
    NeurobusMessage,
    ConsensusMethod,
)
from dnalang_sdk.social_agents import (
    SocialAgent,
    SocialSwarmCoordinator,
    SocialContent,
    SocialProfile,
    Platform,
    ContentType,
    EngagementType,
    CampaignMetrics,
)
from dnalang_sdk.recruitment_engine import (
    RecruitmentEngine,
    Candidate,
    JobPosting,
    RecruitmentStage,
    SkillAssessment,
    SkillCategory,
    CultureFitScore,
    ConsciousnessCompatibility,
)
from dnalang_sdk.dev_swarm import (
    DevSwarm,
    DevSwarmConfig,
    DevPhase,
    SwarmMode,
    DevMetrics,
    create_dev_swarm,
)


# ═══════════════════════════════════════════════════════════════════════════════
# SwarmOrganism Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestConsciousnessMetrics:
    """Tests for ConsciousnessMetrics dataclass."""

    def test_defaults(self):
        m = ConsciousnessMetrics()
        assert m.lambda_coherence == 0.5
        assert m.phi_consciousness == 0.3
        assert m.gamma_decoherence == 0.1
        assert m.psi_entanglement == 0.2

    def test_xi_negentropy(self):
        m = ConsciousnessMetrics(lambda_coherence=0.8, phi_consciousness=0.6, gamma_decoherence=0.2)
        expected = 0.8 * 0.6 / 0.2
        assert abs(m.xi_negentropy - expected) < 1e-9

    def test_xi_negentropy_zero_gamma(self):
        m = ConsciousnessMetrics(gamma_decoherence=0.0)
        # Should use 0.001 floor
        expected = m.lambda_coherence * m.phi_consciousness / 0.001
        assert abs(m.xi_negentropy - expected) < 1e-9

    def test_is_conscious_below_threshold(self):
        m = ConsciousnessMetrics(phi_consciousness=0.5)
        assert m.is_conscious is False

    def test_is_conscious_above_threshold(self):
        m = ConsciousnessMetrics(phi_consciousness=POC_THRESHOLD)
        assert m.is_conscious is True

    def test_evolve(self):
        m = ConsciousnessMetrics()
        old_lambda = m.lambda_coherence
        m.evolve(dt=0.1)
        # Values should change but stay in [0, 1]
        assert 0 <= m.lambda_coherence <= 1
        assert 0 <= m.phi_consciousness <= 1
        assert 0.001 <= m.gamma_decoherence <= 1


class TestPhaseState:
    def test_defaults(self):
        p = PhaseState()
        assert p.theta == 0.0
        assert p.phi == 0.0
        assert p.omega == 0.1

    def test_torsion_coupling(self):
        p = PhaseState(theta=0.5, phi=0.3)
        tc = p.torsion_coupling
        assert isinstance(tc, float)

    def test_evolve(self):
        p = PhaseState(theta=0.0, phi=0.0, omega=1.0)
        p.evolve(dt=0.5)
        assert p.theta > 0
        assert p.phi > 0


class TestSkill:
    def test_creation(self):
        s = Skill(name="python")
        assert s.name == "python"
        assert s.level == SkillLevel.NOVICE
        assert s.experience == 0.0
        assert s.last_used is None

    def test_use(self):
        s = Skill(name="python")
        s.use()
        assert s.experience > 0
        assert s.last_used is not None

    def test_decay(self):
        s = Skill(name="python", experience=50.0)
        s.decay(days_unused=5.0)
        assert s.experience < 50.0


class TestGene:
    def test_creation(self):
        g = Gene(name="creativity", value=0.7)
        assert g.name == "creativity"
        assert g.value == 0.7
        assert g.mutation_rate == 0.01

    def test_mutate(self):
        g = Gene(name="creativity", value=0.5, mutation_rate=0.1)
        mutated = g.mutate()
        assert mutated.name == "creativity"
        assert 0 <= mutated.value <= 1
        assert mutated is not g


class TestMemory:
    def test_creation(self):
        m = Memory(content="test info")
        assert m.content == "test info"
        assert m.importance == 0.5
        assert m.access_count == 0

    def test_access(self):
        m = Memory(content="test")
        m.access()
        assert m.access_count == 1
        assert m.importance > 0.5


class TestSocialConnection:
    def test_creation(self):
        c = SocialConnection(target_id="abc")
        assert c.target_id == "abc"
        assert c.strength == 0.5
        assert c.trust == 0.5
        assert c.interactions == 0

    def test_positive_interaction(self):
        c = SocialConnection(target_id="abc")
        c.interact(positive=True)
        assert c.interactions == 1
        assert c.strength > 0.5
        assert c.trust > 0.5

    def test_negative_interaction(self):
        c = SocialConnection(target_id="abc")
        c.interact(positive=False)
        assert c.interactions == 1
        assert c.strength < 0.5
        assert c.trust < 0.5


class TestSwarmOrganism:
    def test_creation_defaults(self):
        org = SwarmOrganism(name="TestOrg")
        assert org.name == "TestOrg"
        assert org.role == OrganismRole.DEVELOPER
        assert org.state == OrganismState.ACTIVE
        assert len(org.id) > 0
        assert len(org.genesis_hash) == 16
        assert org.energy == 1.0

    def test_creation_with_role(self):
        org = SwarmOrganism(name="Tester", role=OrganismRole.TESTER)
        assert org.role == OrganismRole.TESTER

    def test_creation_with_skills(self):
        org = SwarmOrganism(name="Dev", initial_skills=["python", "git"])
        assert "python" in org.skills
        assert "git" in org.skills

    def test_default_genes(self):
        org = SwarmOrganism(name="Dev")
        for gene_name in ["learning_rate", "collaboration", "creativity", "focus", "resilience", "curiosity"]:
            assert gene_name in org.genes

    def test_custom_genes(self):
        org = SwarmOrganism(name="Dev", genes={"creativity": 0.9})
        assert org.genes["creativity"].value == 0.9

    def test_position_11d(self):
        org = SwarmOrganism(name="Dev")
        assert len(org.position_11d) == 11
        for dim in DIMENSIONS_11D:
            assert dim in org.position_11d

    def test_coherence_score(self):
        org = SwarmOrganism(name="Dev")
        score = org.coherence_score
        assert isinstance(score, float)
        assert 0 <= score <= 1

    def test_social_influence(self):
        org = SwarmOrganism(name="Dev")
        influence = org.social_influence
        assert isinstance(influence, float)

    def test_evolve(self):
        org = SwarmOrganism(name="Dev")
        old_energy = org.energy
        org.evolve(dt=1.0)
        assert org.energy <= old_energy

    def test_learn(self):
        org = SwarmOrganism(name="Dev")
        org.learn("quantum mechanics", importance=0.8)
        assert len(org.memories) == 1
        assert org.memories[0].content == "quantum mechanics"

    def test_use_skill_exists(self):
        org = SwarmOrganism(name="Dev", initial_skills=["python"])
        assert org.use_skill("python") is True

    def test_use_skill_missing(self):
        org = SwarmOrganism(name="Dev")
        assert org.use_skill("nonexistent") is False

    def test_add_skill(self):
        org = SwarmOrganism(name="Dev")
        org.add_skill("rust", SkillLevel.COMPETENT)
        assert "rust" in org.skills
        assert org.skills["rust"].level == SkillLevel.COMPETENT

    def test_connect(self):
        org = SwarmOrganism(name="Dev")
        org.connect("other_id", initial_strength=0.7)
        assert "other_id" in org.connections
        assert org.connections["other_id"].strength == 0.7

    def test_follow_and_follower(self):
        org = SwarmOrganism(name="Dev")
        org.follow("leader_id")
        org.add_follower("fan_id")
        assert "leader_id" in org.following
        assert "fan_id" in org.followers

    def test_rest(self):
        org = SwarmOrganism(name="Dev")
        org.energy = 0.5
        org.rest(duration=2.0)
        assert org.energy > 0.5
        assert org.state == OrganismState.ACTIVE

    def test_dissolve(self):
        org = SwarmOrganism(name="Dev")
        org.dissolve()
        assert org.state == OrganismState.DISSOLVED
        assert org.energy == 0

    def test_mutate(self):
        org = SwarmOrganism(name="Dev", initial_skills=["python"])
        offspring = org.mutate()
        assert offspring is not org
        assert offspring.name.startswith("Dev_v")
        assert offspring.role == org.role

    def test_to_dict(self):
        org = SwarmOrganism(name="Dev")
        d = org.to_dict()
        assert d["name"] == "Dev"
        assert d["role"] == "developer"
        assert "consciousness" in d
        assert "phase" in d
        assert "skills" in d
        assert "genes" in d
        assert "social" in d

    @pytest.mark.asyncio
    async def test_execute_task(self):
        org = SwarmOrganism(name="Dev", role=OrganismRole.DEVELOPER)
        result = await org.execute_task("build feature")
        assert result["success"] is True
        assert result["organism_name"] == "Dev"
        assert result["output"]["type"] == "development"
        assert org.state == OrganismState.ACTIVE

    def test_repr(self):
        org = SwarmOrganism(name="Dev")
        r = repr(org)
        assert "Dev" in r
        assert "developer" in r


# ═══════════════════════════════════════════════════════════════════════════════
# SwarmCollective Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestSwarmCollective:
    def test_creation_defaults(self):
        swarm = SwarmCollective()
        assert swarm.name == "OmegaSwarm"
        assert swarm.state == SwarmState.ACTIVE
        assert swarm.max_organisms == 100
        assert len(swarm.organisms) == 0

    def test_creation_custom(self):
        swarm = SwarmCollective(name="Custom", max_organisms=10, consensus_method=ConsensusMethod.MAJORITY)
        assert swarm.name == "Custom"
        assert swarm.max_organisms == 10
        assert swarm.consensus_method == ConsensusMethod.MAJORITY

    def test_spawn_organism(self):
        swarm = SwarmCollective()
        org = swarm.spawn_organism("Agent1", OrganismRole.DEVELOPER)
        assert org.name == "Agent1"
        assert org.id in swarm.organisms
        assert swarm.metrics.total_organisms == 1

    def test_spawn_max_capacity(self):
        swarm = SwarmCollective(max_organisms=2)
        swarm.spawn_organism("A1")
        swarm.spawn_organism("A2")
        with pytest.raises(ValueError, match="max capacity"):
            swarm.spawn_organism("A3")

    def test_spawn_swarm_team(self):
        swarm = SwarmCollective()
        team = swarm.spawn_swarm_team(team_size=3)
        assert len(team) == 3
        assert len(swarm.organisms) == 3

    def test_remove_organism(self):
        swarm = SwarmCollective()
        org = swarm.spawn_organism("Agent1")
        swarm.remove_organism(org.id)
        assert org.id not in swarm.organisms
        assert org.state == OrganismState.DISSOLVED

    def test_global_lambda_field_empty(self):
        swarm = SwarmCollective()
        assert swarm.global_lambda_field == 0.0

    def test_global_lambda_field_nonempty(self):
        swarm = SwarmCollective()
        swarm.spawn_organism("A1")
        assert isinstance(swarm.global_lambda_field, float)

    def test_swarm_cohesion_empty(self):
        swarm = SwarmCollective()
        assert swarm.swarm_cohesion == 0.0

    def test_neurobus_initialized(self):
        swarm = SwarmCollective()
        assert len(swarm.neurobus) == len(NeurobusChannel)

    def test_subscribe_handler(self):
        swarm = SwarmCollective()
        received = []
        swarm.subscribe(NeurobusChannel.SWARM_BROADCAST, lambda msg: received.append(msg))
        swarm._broadcast(NeurobusChannel.SWARM_BROADCAST, "sender", {"data": "test"})
        assert len(received) == 1

    def test_get_organisms_by_role(self):
        swarm = SwarmCollective()
        swarm.spawn_organism("Dev1", OrganismRole.DEVELOPER)
        swarm.spawn_organism("Tester1", OrganismRole.TESTER)
        swarm.spawn_organism("Dev2", OrganismRole.DEVELOPER)
        devs = swarm.get_organisms_by_role(OrganismRole.DEVELOPER)
        assert len(devs) == 2

    @pytest.mark.asyncio
    async def test_synchronize(self):
        swarm = SwarmCollective()
        swarm.spawn_organism("A1")
        swarm.spawn_organism("A2")
        await swarm.synchronize()
        assert swarm.state == SwarmState.ACTIVE

    @pytest.mark.asyncio
    async def test_elect_leader_empty(self):
        swarm = SwarmCollective()
        leader = await swarm.elect_leader()
        assert leader is None

    @pytest.mark.asyncio
    async def test_elect_leader(self):
        swarm = SwarmCollective()
        swarm.spawn_organism("A1")
        swarm.spawn_organism("A2")
        leader = await swarm.elect_leader()
        assert leader is not None
        assert swarm.leader_id is not None

    @pytest.mark.asyncio
    async def test_submit_task(self):
        swarm = SwarmCollective()
        task = await swarm.submit_task("Build API", [OrganismRole.DEVELOPER])
        assert isinstance(task, SwarmTask)
        assert task.description == "Build API"
        assert task.status == "pending"

    @pytest.mark.asyncio
    async def test_reach_consensus(self):
        swarm = SwarmCollective()
        swarm.spawn_organism("A1")
        swarm.spawn_organism("A2")
        decision, confidence = await swarm.reach_consensus("Pick framework", ["React", "Vue", "Angular"])
        assert decision in ["React", "Vue", "Angular"]
        assert 0 <= confidence <= 1

    def test_to_dict(self):
        swarm = SwarmCollective()
        swarm.spawn_organism("A1")
        d = swarm.to_dict()
        assert d["name"] == "OmegaSwarm"
        assert "metrics" in d
        assert "organisms" in d


# ═══════════════════════════════════════════════════════════════════════════════
# SocialAgent Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestSocialContent:
    def test_defaults(self):
        c = SocialContent()
        assert c.content_type == ContentType.POST
        assert c.platform == Platform.TWITTER
        assert c.text == ""
        assert c.published is False
        assert c.likes == 0

    def test_engagement_rate_zero_views(self):
        c = SocialContent()
        assert c.engagement_rate == 0.0

    def test_engagement_rate_with_views(self):
        c = SocialContent(views=100, likes=5, shares=2, comments=3)
        assert abs(c.engagement_rate - 0.10) < 1e-9

    def test_virality_score_zero_views(self):
        c = SocialContent()
        assert c.virality_score == 0.0


class TestSocialProfile:
    def test_defaults(self):
        p = SocialProfile()
        assert p.platform == Platform.TWITTER
        assert p.followers == 0

    def test_follower_ratio(self):
        p = SocialProfile(followers=100, following=50)
        assert p.follower_ratio == 2.0

    def test_follower_ratio_zero_following(self):
        p = SocialProfile(followers=100, following=0)
        assert p.follower_ratio == 100.0


class TestCampaignMetrics:
    def test_defaults(self):
        m = CampaignMetrics()
        assert m.impressions == 0
        assert m.conversion_rate == 0.0
        assert m.engagement_rate == 0.0

    def test_conversion_rate(self):
        m = CampaignMetrics(clicks=100, conversions=5)
        assert abs(m.conversion_rate - 0.05) < 1e-9


class TestSocialAgent:
    def test_creation(self):
        agent = SocialAgent(name="BotOne")
        assert agent.name == "BotOne"
        assert len(agent.platforms) == 3
        assert Platform.TWITTER in agent.platforms
        assert len(agent.profiles) == 3

    def test_creation_custom_platforms(self):
        agent = SocialAgent(name="Bot", platforms=[Platform.GITHUB])
        assert len(agent.platforms) == 1
        assert Platform.GITHUB in agent.profiles

    @pytest.mark.asyncio
    async def test_create_content(self):
        agent = SocialAgent(name="Bot")
        content = await agent.create_content("Hello world!", ContentType.POST, Platform.TWITTER)
        assert isinstance(content, SocialContent)
        assert content.text == "Hello world!"
        assert content.platform == Platform.TWITTER

    @pytest.mark.asyncio
    async def test_publish(self):
        agent = SocialAgent(name="Bot")
        content = await agent.create_content("Test post")
        result = await agent.publish(content)
        assert result["success"] is True
        assert content.published is True
        assert content in agent.content_history

    @pytest.mark.asyncio
    async def test_follow(self):
        agent = SocialAgent(name="Bot")
        result = await agent.follow("target_123")
        assert result is True
        assert "target_123" in agent.network

    def test_add_follower(self):
        agent = SocialAgent(name="Bot")
        agent.add_follower("fan_1")
        assert agent.profiles[Platform.TWITTER].followers == 1

    @pytest.mark.asyncio
    async def test_generate_thread(self):
        agent = SocialAgent(name="Bot")
        thread = await agent.generate_thread("quantum computing", num_posts=3)
        assert len(thread) == 3
        assert all(isinstance(c, SocialContent) for c in thread)

    def test_to_dict(self):
        agent = SocialAgent(name="Bot")
        d = agent.to_dict()
        assert d["name"] == "Bot"
        assert "platforms" in d
        assert "profiles" in d
        assert "skills" in d


class TestSocialSwarmCoordinator:
    def test_creation(self):
        coord = SocialSwarmCoordinator(name="TestSwarm")
        assert coord.name == "TestSwarm"
        assert len(coord.agents) == 0

    def test_add_agent(self):
        coord = SocialSwarmCoordinator()
        agent = SocialAgent(name="Agent1")
        coord.add_agent(agent)
        assert agent.id in coord.agents

    def test_add_multiple_agents_connect(self):
        coord = SocialSwarmCoordinator()
        a1 = SocialAgent(name="A1")
        a2 = SocialAgent(name="A2")
        coord.add_agent(a1)
        coord.add_agent(a2)
        assert a2.id in a1.network
        assert a1.id in a2.network

    def test_to_dict(self):
        coord = SocialSwarmCoordinator()
        d = coord.to_dict()
        assert "agents_count" in d
        assert "campaigns_count" in d


# ═══════════════════════════════════════════════════════════════════════════════
# RecruitmentEngine Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestCultureFitScore:
    def test_defaults(self):
        score = CultureFitScore()
        assert score.overall == 0.5

    def test_custom(self):
        score = CultureFitScore(collaboration=1.0, innovation=1.0, autonomy=1.0,
                                learning_orientation=1.0, quantum_mindset=1.0)
        assert score.overall == 1.0


class TestConsciousnessCompatibility:
    def test_defaults(self):
        cc = ConsciousnessCompatibility()
        assert cc.overall == 0.5

    def test_custom(self):
        cc = ConsciousnessCompatibility(phase_alignment=0.8, coherence_match=0.9,
                                        consciousness_potential=0.7, integration_ease=0.6)
        assert abs(cc.overall - 0.75) < 1e-9


class TestCandidate:
    def test_creation(self):
        c = Candidate(name="Alice", email="alice@test.com")
        assert c.name == "Alice"
        assert c.email == "alice@test.com"
        assert c.stage == RecruitmentStage.SOURCING
        assert c.desired_role == OrganismRole.DEVELOPER

    def test_advance_stage(self):
        c = Candidate(name="Alice", email="a@b.com")
        c.advance_stage(RecruitmentStage.SCREENING, "Passed initial check")
        assert c.stage == RecruitmentStage.SCREENING
        assert len(c.stage_history) == 1
        assert "Passed initial check" in c.notes

    def test_top_skills_empty(self):
        c = Candidate(name="Alice", email="a@b.com")
        assert c.top_skills == []


class TestJobPosting:
    def test_creation(self):
        jp = JobPosting(title="Quantum Dev", role=OrganismRole.QUANTUM_SPECIALIST)
        assert jp.title == "Quantum Dev"
        assert jp.active is True
        assert jp.remote_ok is True
        assert jp.applications == 0


class TestRecruitmentEngine:
    def test_creation(self):
        engine = RecruitmentEngine(organization_name="TestOrg")
        assert engine.organization_name == "TestOrg"
        assert len(engine.candidates) == 0
        assert engine.total_hires == 0

    def test_create_job_posting(self):
        engine = RecruitmentEngine()
        posting = engine.create_job_posting("Dev", OrganismRole.DEVELOPER, "Build things")
        assert isinstance(posting, JobPosting)
        assert posting.title == "Dev"
        assert posting.id in engine.job_postings

    def test_add_candidate(self):
        engine = RecruitmentEngine()
        candidate = engine.add_candidate("Bob", "bob@test.com", OrganismRole.DEVELOPER)
        assert isinstance(candidate, Candidate)
        assert candidate.id in engine.candidates
        assert candidate.id in engine.pipeline[RecruitmentStage.SOURCING]

    @pytest.mark.asyncio
    async def test_screen_candidate(self):
        engine = RecruitmentEngine()
        candidate = engine.add_candidate("Charlie", "c@t.com")
        result = await engine.screen_candidate(candidate.id)
        assert result["proceed"] is True

    @pytest.mark.asyncio
    async def test_screen_nonexistent(self):
        engine = RecruitmentEngine()
        result = await engine.screen_candidate("fake_id")
        assert "error" in result

    @pytest.mark.asyncio
    async def test_assess_skills(self):
        engine = RecruitmentEngine()
        candidate = engine.add_candidate("Diana", "d@t.com")
        assessments = await engine.assess_skills(candidate.id)
        assert len(assessments) > 0
        assert all(isinstance(a, SkillAssessment) for a in assessments)

    @pytest.mark.asyncio
    async def test_assess_culture_fit(self):
        engine = RecruitmentEngine()
        candidate = engine.add_candidate("Eve", "e@t.com")
        score = await engine.assess_culture_fit(candidate.id)
        assert isinstance(score, CultureFitScore)
        assert 0 <= score.overall <= 1

    @pytest.mark.asyncio
    async def test_assess_consciousness(self):
        engine = RecruitmentEngine()
        candidate = engine.add_candidate("Frank", "f@t.com")
        compat = await engine.assess_consciousness(candidate.id)
        assert isinstance(compat, ConsciousnessCompatibility)

    def test_get_pipeline_stats(self):
        engine = RecruitmentEngine()
        engine.add_candidate("G", "g@t.com")
        stats = engine.get_pipeline_stats()
        assert stats["total_candidates"] == 1
        assert "by_stage" in stats

    def test_predict_success_nonexistent(self):
        engine = RecruitmentEngine()
        assert engine.predict_success("fake") == 0.0

    def test_to_dict(self):
        engine = RecruitmentEngine()
        d = engine.to_dict()
        assert "organization_name" in d
        assert "total_candidates" in d
        assert "pipeline_stats" in d


# ═══════════════════════════════════════════════════════════════════════════════
# DevSwarm Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestDevSwarmConfig:
    def test_defaults(self):
        cfg = DevSwarmConfig()
        assert cfg.name == "OmegaDevSwarm"
        assert cfg.max_organisms == 50
        assert cfg.auto_evolve is True
        assert cfg.social_amplification is True
        assert cfg.recruitment_enabled is True

    def test_custom(self):
        cfg = DevSwarmConfig(name="Custom", max_organisms=10, auto_evolve=False)
        assert cfg.name == "Custom"
        assert cfg.max_organisms == 10
        assert cfg.auto_evolve is False


class TestDevMetrics:
    def test_defaults(self):
        m = DevMetrics()
        assert m.total_tasks_completed == 0
        assert m.total_stories_completed == 0
        assert m.total_hires == 0
        assert m.collective_consciousness == 0.0


class TestDevSwarm:
    def test_creation_defaults(self):
        ds = DevSwarm()
        assert ds.config.name == "OmegaDevSwarm"
        assert ds.phase == DevPhase.IDEATION
        assert ds.mode == SwarmMode.AUTONOMOUS
        assert len(ds.swarm.organisms) == 8  # default team

    def test_creation_custom_config(self):
        cfg = DevSwarmConfig(name="TestSwarm", max_organisms=20)
        ds = DevSwarm(config=cfg)
        assert ds.config.name == "TestSwarm"

    def test_factory_function(self):
        ds = create_dev_swarm(name="Factory", max_organisms=15)
        assert isinstance(ds, DevSwarm)
        assert ds.config.name == "Factory"

    def test_spawn_organism(self):
        ds = DevSwarm()
        initial = len(ds.swarm.organisms)
        org = ds.spawn_organism("NewAgent", OrganismRole.DEVELOPER)
        assert len(ds.swarm.organisms) == initial + 1
        assert org.name == "NewAgent"

    def test_event_handlers(self):
        ds = DevSwarm()
        events = []
        ds.on("test_event", lambda data: events.append(data))
        ds._emit_event("test_event", {"key": "val"})
        assert len(events) == 1
        assert events[0]["key"] == "val"

    def test_get_swarm_status(self):
        ds = DevSwarm()
        status = ds.get_swarm_status()
        assert "swarm" in status
        assert "phase" in status
        assert "mode" in status
        assert "metrics" in status

    @pytest.mark.asyncio
    async def test_execute_task(self):
        ds = DevSwarm()
        result = await ds.execute_task("build login page", [OrganismRole.DEVELOPER])
        assert "task_id" in result
        assert "description" in result

    @pytest.mark.asyncio
    async def test_research(self):
        ds = DevSwarm()
        result = await ds.research("quantum error correction")
        assert "topic" in result
        assert result["researchers"] >= 1

    @pytest.mark.asyncio
    async def test_reach_consensus(self):
        ds = DevSwarm()
        result = await ds.reach_consensus("Best language?", ["Python", "Rust", "Go"])
        assert result["decision"] in ["Python", "Rust", "Go"]
        assert "confidence" in result

    def test_to_dict(self):
        ds = DevSwarm()
        d = ds.to_dict()
        assert isinstance(d, dict)
        assert "swarm" in d

    def test_repr(self):
        ds = DevSwarm()
        r = repr(ds)
        assert "DevSwarm" in r
