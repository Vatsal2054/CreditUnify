import EnhancedSpeedometer from "../components/Dashboard/Speedometer";

const Dashboard = async () => {
    const data = [
        {
            bureau: "CIBIL",
            score: 540,
            rangeStart: 300,
            rangeEnd: 900,
        },
        {
            bureau: "Experian",
            score: 680,
            rangeStart: 300,
            rangeEnd: 900,
        },
        {
            bureau: "Equifax",
            score: 710,
            rangeStart: 300,
            rangeEnd: 900,
        }
    ];

    return (
        <div className="p-6 bg-gray-50">
            <div className="flex flex-wrap gap-6 justify-center">
                {data.map((bureauData, index) => (
                    <EnhancedSpeedometer key={index} data={bureauData} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;   