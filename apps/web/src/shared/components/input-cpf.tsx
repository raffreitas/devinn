import { formatCpf, removeChars } from "../lib/utils";
import { Input } from "./ui/input";

type BaseInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "onBlur" | "value"
>;

type InputCpfProps = BaseInputProps & {
  value?: string | undefined;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
};

export function InputCpf({ value, onChange, onBlur, ...rest }: InputCpfProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(removeChars(e.target.value).slice(0, 11));
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(removeChars(e.currentTarget.value).slice(0, 11));
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      maxLength={14}
      {...rest}
      onChange={handleChange}
      onBlur={handleBlur}
      value={formatCpf(value)}
    />
  );
}
