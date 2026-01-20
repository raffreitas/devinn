import { Input } from "./ui/input";


type BaseInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "onBlur" | "value"
>;

type InputNumberProps = BaseInputProps & {
  onChange: (value: number) => void;
};


export function InputNumber({ onChange, ...rest }: InputNumberProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const numeric = Number.parseInt(e.target.value || "", 10) || 0;
    onChange(numeric);
  };
  return <Input type="number" inputMode="numeric" onChange={handleChange} {...rest} />
}
