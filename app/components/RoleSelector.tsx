"use client";

import { useState, useMemo } from "react";
import { startInterview } from "../lib/actions/interviews";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";
import InterviewLengthModal from "./InterviewLengthModal";

interface RoleSelectorProps {
    roles: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        difficulty?: string | null;
    }[];
    questionCounts: Record<string, number>;
}

type SortOption = "name" | "name-desc" | "difficulty" | "difficulty-desc" | "questions" | "questions-desc";

export default function RoleSelector({ roles, questionCounts }: RoleSelectorProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("name");
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

    // Get unique difficulty levels
    const difficultyLevels = useMemo(() => {
        const levels = new Set(roles.map(r => r.difficulty).filter(Boolean) as string[]);
        return Array.from(levels).sort();
    }, [roles]);

    // Filter and sort roles
    const filteredRoles = useMemo(() => {
        let filtered = roles.filter((role) => {
            const matchesSearch = 
                role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (role.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            
            const matchesDifficulty = 
                selectedDifficulties.length === 0 || 
                (role.difficulty && selectedDifficulties.includes(role.difficulty));
            
            return matchesSearch && matchesDifficulty;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "name-desc") {
                return b.name.localeCompare(a.name);
            } else if (sortBy === "difficulty") {
                const difficultyOrder = ["Easy", "Medium", "Hard", "Expert"];
                const aIndex = a.difficulty ? difficultyOrder.indexOf(a.difficulty) : -1;
                const bIndex = b.difficulty ? difficultyOrder.indexOf(b.difficulty) : -1;
                return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
            } else if (sortBy === "difficulty-desc") {
                const difficultyOrder = ["Easy", "Medium", "Hard", "Expert"];
                const aIndex = a.difficulty ? difficultyOrder.indexOf(a.difficulty) : -1;
                const bIndex = b.difficulty ? difficultyOrder.indexOf(b.difficulty) : -1;
                return (bIndex === -1 ? 999 : bIndex) - (aIndex === -1 ? 999 : aIndex);
            } else if (sortBy === "questions") {
                const aCount = questionCounts[a.id] || 0;
                const bCount = questionCounts[b.id] || 0;
                return bCount - aCount;
            } else if (sortBy === "questions-desc") {
                const aCount = questionCounts[a.id] || 0;
                const bCount = questionCounts[b.id] || 0;
                return aCount - bCount;
            }
            return 0;
        });

        return filtered;
    }, [roles, searchQuery, selectedDifficulties, sortBy, questionCounts]);

    const handleStartClick = (roleId: string) => {
        setSelectedRoleId(roleId);
        setModalOpen(true);
    };

    const handleSelectLength = async (length: "quick" | "standard" | "deep_dive") => {
        if (!selectedRoleId) return;
        
        setModalOpen(false);
        setLoading(selectedRoleId);
        setError("");
        
        try {
            await startInterview(selectedRoleId, length);
        } catch (err) {
            console.error("Error starting interview:", err);
            setError(err instanceof Error ? err.message : "Failed to start interview");
            setLoading(null);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRoleId(null);
    };

    const toggleDifficulty = (difficulty: string) => {
        setSelectedDifficulties(prev => 
            prev.includes(difficulty)
                ? prev.filter(d => d !== difficulty)
                : [...prev, difficulty]
        );
    };

    if (roles.length === 0) {
        return (
            <EmptyState
                title="No roles available"
                description="There are currently no interview roles configured. Please contact support or check back later."
            />
        );
    }

    return (
        <div className="role-selector">
            {error && <ErrorMessage message={error} />}
            
            {/* Search and Controls */}
            <div className="role-controls">
                <input
                    type="search"
                    placeholder="Search by role name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="role-search"
                />
                
                <div className="role-filters">
                    <div className="filter-group">
                        <label htmlFor="sort-select">Sort by:</label>
                        <select 
                            id="sort-select"
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="sort-select"
                        >
                            <option value="name">Name (A → Z)</option>
                            <option value="name-desc">Name (Z → A)</option>
                            <option value="difficulty">Difficulty (Easy → Hard)</option>
                            <option value="difficulty-desc">Difficulty (Hard → Easy)</option>
                            <option value="questions">Questions Available (Larger → Smaller)</option>
                            <option value="questions-desc">Questions Available (Smaller → Larger)</option>
                        </select>
                    </div>
                    
                    {difficultyLevels.length > 0 && (
                        <div className="filter-group">
                            <span className="filter-label">Difficulty:</span>
                            <div className="checkbox-group">
                                {difficultyLevels.map(level => (
                                    <label key={level} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedDifficulties.includes(level)}
                                            onChange={() => toggleDifficulty(level)}
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Table */}
            {filteredRoles.length === 0 ? (
                <EmptyState
                    title="No roles found"
                    description="No roles match your search criteria. Try adjusting your filters or search query."
                />
            ) : (
                <div className="role-table-container">
                    <table className="role-table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Description</th>
                                <th>Difficulty</th>
                                <th>Questions</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.map((role) => (
                                <tr key={role.id}>
                                    <td className="role-name">{role.name}</td>
                                    <td className="role-description">
                                        {role.description || "No description available"}
                                    </td>
                                    <td>
                                        {role.difficulty && (
                                            <span className={`difficulty-badge difficulty-${role.difficulty.toLowerCase()}`}>
                                                {role.difficulty}
                                            </span>
                                        )}
                                    </td>
                                    <td className="role-questions">
                                        {questionCounts[role.id] || 0}
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleStartClick(role.id)}
                                            disabled={loading !== null}
                                            className={`action-button ${loading === role.id ? "loading" : ""}`}
                                        >
                                            {loading === role.id ? "Starting..." : "Start"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <InterviewLengthModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSelectLength={handleSelectLength}
                availableQuestions={selectedRoleId ? questionCounts[selectedRoleId] || 0 : 0}
            />
        </div>
    );
}