import type React from 'react';

export interface BattleArgument {
    icon: React.ElementType;
    title: string;
    detail: string;
    source?: string;
}

export interface Competitor {
    id: string;
    name: string;
    color: string;
    logoText: string;
    weaknesses: BattleArgument[];
    telekomArguments: BattleArgument[];
}

export interface Objection {
    id: string;
    title: string;
    coreArgument: string;
    exampleText: string;
    tip: string;
    icon: React.ElementType;
}
