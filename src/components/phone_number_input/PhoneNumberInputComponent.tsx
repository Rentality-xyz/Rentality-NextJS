import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneInputComponentProps {
    onChange: (value: string) => void;
}

function PhoneInputComponent({ onChange }: PhoneInputComponentProps) {
    const [value, setValue] = React.useState('');
    const handleChange = (val: string) => {
        setValue(val);
        onChange(val);
    };

    return (
        <div className="text-black flex flex-col w-full lg:w-60">
            <label className="text-rnt-temp-main-text whitespace-nowrap mb-1">
                Phone number
            </label>
            <PhoneInput
                specialLabel="Phone number"
                containerClass="h-12"
                country={"us"}
                placeholder="Enter phone number"
                value={value}
                onChange={handleChange}
                inputStyle = {{fontFamily: "'Montserrat', Arial, sans-serif", width: "100%", height: "48px", borderRadius: "9999px"}}
            />
        </div>
    );
}

export default PhoneInputComponent;