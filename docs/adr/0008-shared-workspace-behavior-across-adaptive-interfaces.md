# Shared Workspace Behavior Across Adaptive Interfaces

Status: Accepted

Belfry's web and terminal interfaces provide behavioral parity for the core
trace and log workflows while using layouts and controls suited to each medium.
A framework-independent Workspace state machine and shared view models own
filtering, selection, trace-to-log correlation, navigation, refresh state, and
copyable identifiers. The web renderer adds URL-addressable and mouse-oriented
behavior; the OpenTUI renderer adds keyboard-first navigation and responsive
terminal panes. Components and layouts are not forced to be visually identical.
