import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthSelectorProps {
  value: { month: number; year: number };
  onChange: (month: number, year: number) => void;
}

const MonthSelector = ({ value, onChange }: MonthSelectorProps) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate last 12 months
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    let month = currentMonth - i;
    let year = currentYear;
    
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    
    monthOptions.push({ month, year });
  }

  return (
    <div className="flex gap-2">
      <Select
        value={`${value.month}-${value.year}`}
        onValueChange={(val) => {
          const [month, year] = val.split('-').map(Number);
          onChange(month, year);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map(({ month, year }) => (
            <SelectItem key={`${month}-${year}`} value={`${month}-${year}`}>
              {months[month - 1]} {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MonthSelector;
