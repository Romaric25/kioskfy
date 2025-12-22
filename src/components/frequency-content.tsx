
interface FrequencyContentProps {
    frequency: string;
}

export const FrequencyContent = ({ frequency }: FrequencyContentProps) => {
    const getLabel = (freq: string) => {
        switch (freq) {
            case "Daily":
                return "Quotidien";
            case "Weekly":
                return "Hebdomadaire";
            case "Bi-weekly":
                return "Bi-hebdomadaire";
            case "Three-weekly":
                return "Tri-hebdomadaire";
            case "Monthly":
                return "Mensuel";
            case "Quarterly":
                return "Trimestriel";
            case "Yearly":
                return "Annuel";
            default:
                return freq;
        }
    };

    return <>{getLabel(frequency)}</>;
};