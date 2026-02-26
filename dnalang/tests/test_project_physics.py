"""Tests for project_manager.py and physics_tools.py"""

import pytest
import asyncio
from datetime import datetime, timedelta

from dnalang_sdk.project_manager import (
    QuantumProjectManager,
    UserStory,
    Sprint,
    StoryStatus,
    StoryPriority,
    SprintStatus,
    Retrospective,
    RetroItem,
)
from dnalang_sdk.physics_tools import (
    LAMBDA_PHI,
    THETA_LOCK,
    PHI_THRESHOLD,
    GAMMA_CRITICAL,
    CHI_PC,
    TAU_ZERO,
    dispatch_physics,
    _render_constants,
    _render_predictions,
    tool_tau_phase,
    tool_compile_organism,
    tool_crsm_validate,
    tool_ecosystem,
)


# ═══════════════════════════════════════════════════════════════════════
# StoryStatus / StoryPriority / SprintStatus Enums
# ═══════════════════════════════════════════════════════════════════════

class TestEnums:
    def test_story_status_values(self):
        assert StoryStatus.BACKLOG.value == "backlog"
        assert StoryStatus.READY.value == "ready"
        assert StoryStatus.IN_PROGRESS.value == "in_progress"
        assert StoryStatus.REVIEW.value == "review"
        assert StoryStatus.TESTING.value == "testing"
        assert StoryStatus.DONE.value == "done"
        assert StoryStatus.BLOCKED.value == "blocked"

    def test_story_priority_values(self):
        assert StoryPriority.CRITICAL.value == 1
        assert StoryPriority.HIGH.value == 2
        assert StoryPriority.MEDIUM.value == 3
        assert StoryPriority.LOW.value == 4
        assert StoryPriority.NICE_TO_HAVE.value == 5

    def test_sprint_status_values(self):
        assert SprintStatus.PLANNING.value == "planning"
        assert SprintStatus.ACTIVE.value == "active"
        assert SprintStatus.REVIEW.value == "review"
        assert SprintStatus.RETROSPECTIVE.value == "retrospective"
        assert SprintStatus.COMPLETED.value == "completed"


# ═══════════════════════════════════════════════════════════════════════
# UserStory
# ═══════════════════════════════════════════════════════════════════════

class TestUserStory:
    def test_defaults(self):
        story = UserStory()
        assert story.title == ""
        assert story.description == ""
        assert story.story_points == 0
        assert story.priority == StoryPriority.MEDIUM
        assert story.status == StoryStatus.BACKLOG
        assert story.assigned_to is None
        assert story.labels == []
        assert story.acceptance_criteria == []
        assert story.consciousness_weight == 0.5
        assert story.coherence_score == 0.5
        assert isinstance(story.id, str)
        assert isinstance(story.created_at, datetime)

    def test_custom_values(self):
        story = UserStory(
            title="Test",
            description="desc",
            story_points=5,
            priority=StoryPriority.HIGH,
            labels=["feature"],
        )
        assert story.title == "Test"
        assert story.story_points == 5
        assert story.priority == StoryPriority.HIGH
        assert story.labels == ["feature"]

    def test_quantum_priority(self):
        story = UserStory(priority=StoryPriority.CRITICAL, consciousness_weight=1.0, coherence_score=1.0)
        # base_priority = 6 - 1 = 5, * 1.0 * 1.0 = 5.0
        assert story.quantum_priority == 5.0

    def test_quantum_priority_low(self):
        story = UserStory(priority=StoryPriority.NICE_TO_HAVE, consciousness_weight=0.5, coherence_score=0.5)
        # base_priority = 6 - 5 = 1, * 0.5 * 0.5 = 0.25
        assert story.quantum_priority == pytest.approx(0.25)

    def test_cycle_time_none_when_not_started(self):
        story = UserStory()
        assert story.cycle_time is None

    def test_cycle_time_none_when_not_completed(self):
        story = UserStory(started_at=datetime.now())
        assert story.cycle_time is None

    def test_cycle_time_calculated(self):
        start = datetime(2025, 1, 1, 10, 0)
        end = datetime(2025, 1, 1, 12, 0)
        story = UserStory(started_at=start, completed_at=end)
        assert story.cycle_time == pytest.approx(2.0)


# ═══════════════════════════════════════════════════════════════════════
# Sprint
# ═══════════════════════════════════════════════════════════════════════

class TestSprint:
    def test_defaults(self):
        sprint = Sprint()
        assert sprint.name == ""
        assert sprint.goal == ""
        assert sprint.status == SprintStatus.PLANNING
        assert sprint.duration_days == 14
        assert sprint.stories == []
        assert sprint.committed_points == 0
        assert sprint.completed_points == 0
        assert sprint.velocity == 0.0
        assert sprint.burndown_data == []
        assert sprint.decoherence_rate == pytest.approx(0.1)

    def test_progress_zero_committed(self):
        sprint = Sprint(committed_points=0)
        assert sprint.progress == 0.0

    def test_progress_partial(self):
        sprint = Sprint(committed_points=10, completed_points=5)
        assert sprint.progress == pytest.approx(0.5)

    def test_stories_by_status(self):
        s1 = UserStory(status=StoryStatus.DONE, story_points=3)
        s2 = UserStory(status=StoryStatus.BACKLOG, story_points=5)
        sprint = Sprint(stories=[s1, s2])
        by_status = sprint.stories_by_status
        assert len(by_status[StoryStatus.DONE]) == 1
        assert len(by_status[StoryStatus.BACKLOG]) == 1
        assert len(by_status[StoryStatus.IN_PROGRESS]) == 0

    def test_remaining_points(self):
        s1 = UserStory(status=StoryStatus.DONE, story_points=3)
        s2 = UserStory(status=StoryStatus.IN_PROGRESS, story_points=5)
        sprint = Sprint(stories=[s1, s2])
        assert sprint.remaining_points == 5

    def test_update_burndown(self):
        sprint = Sprint(committed_points=10, completed_points=3)
        sprint.update_burndown()
        assert len(sprint.burndown_data) == 1
        entry = sprint.burndown_data[0]
        assert "timestamp" in entry
        assert entry["completed_points"] == 3
        assert "decoherence_factor" in entry


# ═══════════════════════════════════════════════════════════════════════
# RetroItem / Retrospective
# ═══════════════════════════════════════════════════════════════════════

class TestRetroItem:
    def test_defaults(self):
        item = RetroItem()
        assert item.category == ""
        assert item.text == ""
        assert item.votes == 0
        assert isinstance(item.id, str)

    def test_custom(self):
        item = RetroItem(category="went_well", text="Great work", votes=3)
        assert item.category == "went_well"
        assert item.votes == 3


class TestRetrospective:
    def test_defaults(self):
        retro = Retrospective()
        assert retro.sprint_id == ""
        assert retro.items == []
        assert retro.action_items == []
        assert retro.collective_learning == {}
        assert retro.completed_at is None

    def test_went_well_filter(self):
        items = [
            RetroItem(category="went_well", text="a"),
            RetroItem(category="to_improve", text="b"),
            RetroItem(category="went_well", text="c"),
        ]
        retro = Retrospective(items=items)
        assert len(retro.went_well) == 2
        assert len(retro.to_improve) == 1


# ═══════════════════════════════════════════════════════════════════════
# QuantumProjectManager
# ═══════════════════════════════════════════════════════════════════════

class TestQuantumProjectManager:
    def test_creation(self):
        pm = QuantumProjectManager(project_name="TestProject")
        assert pm.project_name == "TestProject"
        assert pm.swarm is None
        assert pm.product_backlog == []
        assert pm.sprints == []
        assert pm.current_sprint is None
        assert pm.velocity_history == []
        assert isinstance(pm.id, str)
        assert pm.project_coherence == 0.5
        assert pm.collective_consciousness == 0.3

    def test_add_story(self):
        pm = QuantumProjectManager(project_name="Test")
        story = pm.add_story("New Feature", story_points=5, priority=StoryPriority.HIGH)
        assert story.title == "New Feature"
        assert story.story_points == 5
        assert story.priority == StoryPriority.HIGH
        assert story in pm.product_backlog
        assert story.consciousness_weight == pm.collective_consciousness
        assert story.coherence_score == pm.project_coherence

    def test_add_story_with_labels(self):
        pm = QuantumProjectManager(project_name="Test")
        story = pm.add_story("Bug Fix", labels=["bug", "urgent"])
        assert story.labels == ["bug", "urgent"]

    def test_backlog_reprioritization(self):
        pm = QuantumProjectManager(project_name="Test")
        s1 = pm.add_story("Low", priority=StoryPriority.LOW, story_points=1)
        s2 = pm.add_story("Critical", priority=StoryPriority.CRITICAL, story_points=8)
        # Critical should be first (higher quantum_priority)
        assert pm.product_backlog[0].priority == StoryPriority.CRITICAL

    def test_create_sprint(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("Sprint 1", "Build MVP", duration_days=7)
        assert sprint.name == "Sprint 1"
        assert sprint.goal == "Build MVP"
        assert sprint.duration_days == 7
        assert sprint in pm.sprints

    def test_start_sprint(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("S1", "Goal")
        started = pm.start_sprint(sprint)
        assert started.status == SprintStatus.ACTIVE
        assert started.start_date is not None
        assert started.end_date is not None
        assert pm.current_sprint is started

    def test_start_sprint_no_sprint_raises(self):
        pm = QuantumProjectManager(project_name="Test")
        with pytest.raises(ValueError, match="No sprint"):
            pm.start_sprint()

    def test_add_story_to_sprint(self):
        pm = QuantumProjectManager(project_name="Test")
        story = pm.add_story("Feature", story_points=3)
        sprint = pm.create_sprint("S1", "G")
        pm.start_sprint(sprint)
        pm.add_story_to_sprint(story)
        assert story.status == StoryStatus.READY
        assert story in sprint.stories
        assert story not in pm.product_backlog

    def test_add_story_to_sprint_no_active_raises(self):
        pm = QuantumProjectManager(project_name="Test")
        story = pm.add_story("Feature")
        with pytest.raises(ValueError, match="No active sprint"):
            pm.add_story_to_sprint(story)

    def test_complete_story(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("S1", "G")
        pm.start_sprint(sprint)
        story = pm.add_story("Feature", story_points=5)
        pm.add_story_to_sprint(story, sprint)
        pm.complete_story(story)
        assert story.status == StoryStatus.DONE
        assert story.completed_at is not None
        assert sprint.completed_points == 5

    def test_end_sprint(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("S1", "G")
        pm.start_sprint(sprint)
        story = pm.add_story("Feature", story_points=3)
        pm.add_story_to_sprint(story, sprint)
        pm.complete_story(story)
        ended = pm.end_sprint()
        assert ended.status == SprintStatus.REVIEW
        assert ended.velocity == 3
        assert 3.0 in pm.velocity_history
        assert pm.current_sprint is None

    def test_end_sprint_moves_incomplete_to_backlog(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("S1", "G")
        pm.start_sprint(sprint)
        done_story = pm.add_story("Done", story_points=3)
        pm.add_story_to_sprint(done_story, sprint)
        pm.complete_story(done_story)
        incomplete = pm.add_story("WIP", story_points=5)
        pm.add_story_to_sprint(incomplete, sprint)
        pm.end_sprint()
        assert incomplete.status == StoryStatus.BACKLOG
        assert incomplete in pm.product_backlog

    def test_end_sprint_no_active_raises(self):
        pm = QuantumProjectManager(project_name="Test")
        with pytest.raises(ValueError):
            pm.end_sprint()

    @pytest.mark.asyncio
    async def test_assign_story_with_organism_id(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("S1", "G")
        pm.start_sprint(sprint)
        story = pm.add_story("Feature")
        pm.add_story_to_sprint(story)
        result = await pm.assign_story(story, organism_id="org-123")
        assert result is True
        assert story.assigned_to == "org-123"
        assert story.status == StoryStatus.IN_PROGRESS

    @pytest.mark.asyncio
    async def test_assign_story_no_swarm_no_id_returns_false(self):
        pm = QuantumProjectManager(project_name="Test")
        story = pm.add_story("Feature")
        result = await pm.assign_story(story)
        assert result is False

    def test_get_burndown_chart_data(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("S1", "G")
        pm.start_sprint(sprint)
        data = pm.get_burndown_chart_data()
        assert data["sprint_name"] == "S1"
        assert "committed_points" in data
        assert "progress" in data

    def test_get_burndown_no_sprint(self):
        pm = QuantumProjectManager(project_name="Test")
        data = pm.get_burndown_chart_data()
        assert "error" in data

    def test_get_velocity_chart_data(self):
        pm = QuantumProjectManager(project_name="Test")
        data = pm.get_velocity_chart_data()
        assert "history" in data
        assert "predictive" in data
        assert "sprint_names" in data

    def test_get_kanban_board(self):
        pm = QuantumProjectManager(project_name="Test")
        story = pm.add_story("Feature", story_points=3)
        board = pm.get_kanban_board()
        assert "backlog" in board
        assert len(board["backlog"]) == 1
        assert board["backlog"][0]["title"] == "Feature"

    def test_to_dict(self):
        pm = QuantumProjectManager(project_name="TestDict")
        d = pm.to_dict()
        assert d["project_name"] == "TestDict"
        assert d["backlog_size"] == 0
        assert d["predictive_velocity"] == 0
        assert "project_coherence" in d
        assert "collective_consciousness" in d

    @pytest.mark.asyncio
    async def test_run_retrospective(self):
        pm = QuantumProjectManager(project_name="Test")
        sprint = pm.create_sprint("S1", "G")
        pm.start_sprint(sprint)
        pm.end_sprint()
        retro = await pm.run_retrospective()
        assert isinstance(retro, Retrospective)
        assert retro.sprint_id == sprint.id
        assert len(retro.action_items) > 0
        assert retro.completed_at is not None
        assert sprint.status == SprintStatus.COMPLETED
        assert retro in pm.retrospectives

    @pytest.mark.asyncio
    async def test_run_retrospective_no_sprint_raises(self):
        pm = QuantumProjectManager(project_name="Test")
        with pytest.raises(ValueError):
            await pm.run_retrospective()

    def test_repr(self):
        pm = QuantumProjectManager(project_name="MyProj")
        r = repr(pm)
        assert "MyProj" in r
        assert "sprints=" in r

    def test_predictive_velocity_update(self):
        pm = QuantumProjectManager(project_name="Test")
        pm.velocity_history = [10, 20, 30]
        pm._update_predictive_velocity()
        assert pm.predictive_velocity > 0

    def test_predictive_velocity_empty(self):
        pm = QuantumProjectManager(project_name="Test")
        pm._update_predictive_velocity()
        assert pm.predictive_velocity == 0


# ═══════════════════════════════════════════════════════════════════════
# Physics Tools — Constants
# ═══════════════════════════════════════════════════════════════════════

class TestPhysicsConstants:
    def test_lambda_phi(self):
        assert LAMBDA_PHI == pytest.approx(2.176435e-8)

    def test_theta_lock(self):
        assert THETA_LOCK == 51.843

    def test_phi_threshold(self):
        assert PHI_THRESHOLD == 0.7734

    def test_gamma_critical(self):
        assert GAMMA_CRITICAL == 0.3

    def test_chi_pc(self):
        assert CHI_PC == 0.946

    def test_tau_zero(self):
        assert TAU_ZERO == 46.0


# ═══════════════════════════════════════════════════════════════════════
# Physics Tools — Rendering / Dispatch
# ═══════════════════════════════════════════════════════════════════════

class TestPhysicsRendering:
    def test_render_constants_returns_string(self):
        result = _render_constants()
        assert isinstance(result, str)
        assert "Lambda-Phi" in result or "Λ_Φ" in result
        assert str(THETA_LOCK) in result

    def test_render_predictions_returns_string(self):
        result = _render_predictions()
        assert isinstance(result, str)
        assert "Periodicity" in result or "τ₀" in result
        assert "Shapiro" in result

    def test_tool_tau_phase_constants(self):
        result = tool_tau_phase("constants")
        assert isinstance(result, str)
        assert str(THETA_LOCK) in result

    def test_tool_compile_organism_list_returns_string(self):
        # May return "not found" error string but should not crash
        result = tool_compile_organism("list")
        assert isinstance(result, str)

    def test_tool_crsm_validate_constants(self):
        result = tool_crsm_validate("constants")
        assert isinstance(result, str)
        assert str(THETA_LOCK) in result

    def test_tool_crsm_validate_predictions(self):
        result = tool_crsm_validate("predictions")
        assert isinstance(result, str)
        assert "Periodicity" in result or "τ₀" in result


class TestDispatchPhysics:
    def test_dispatch_constants(self):
        result = dispatch_physics("constants")
        assert result is not None
        assert isinstance(result, str)

    def test_dispatch_physics_constants(self):
        result = dispatch_physics("physics constants")
        assert result is not None

    def test_dispatch_predictions(self):
        result = dispatch_physics("predictions")
        assert result is not None

    def test_dispatch_tau_phase(self):
        result = dispatch_physics("tau phase constants")
        assert result is not None

    def test_dispatch_crsm(self):
        result = dispatch_physics("crsm constants")
        assert result is not None

    def test_dispatch_unrecognized_returns_none(self):
        result = dispatch_physics("something totally unrelated xyz123")
        assert result is None

    def test_dispatch_compile_list(self):
        result = dispatch_physics("compile list")
        assert result is not None

    def test_dispatch_ecosystem(self):
        result = dispatch_physics("ecosystem quick")
        assert result is not None
        assert isinstance(result, str)

    def test_dispatch_lambda_phi(self):
        result = dispatch_physics("lambda phi")
        assert result is not None
