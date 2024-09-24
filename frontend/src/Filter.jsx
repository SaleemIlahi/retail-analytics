// src/components/FilterComponent.js
import React, { useState } from "react";
// import { DateRange } from "react-date-range";
import Select, { components } from "react-select";

const ReactMultiSeclect = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [tempSelectedOptions, setTempSelectedOptions] = useState([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];

  const selectAllOption = { value: "all", label: "Select All" };

  const isSelectAllSelected = () => tempSelectedOptions.some(option => option.value === selectAllOption.value);


  const handleSelectChange = (selected) => {
    if (selected?.some(option => option.value === selectAllOption.value)) {
      if (isSelectAllSelected()) {
        setTempSelectedOptions([]);
      } else {
        setTempSelectedOptions([selectAllOption]);
      }
    } else {
      setTempSelectedOptions(selected || []);
    }
  };
  const getAvailableOptions = () => {
    // If "Select All" is selected, only show "Select All"
    if (isSelectAllSelected()) {
      return [selectAllOption];
    } else {
      // Show "Select All" + individual options when not fully selected
      return [selectAllOption, ...options];
    }
  };
  const handleApply = () => {
    setSelectedOptions(tempSelectedOptions);
    setMenuIsOpen(false);
  };

  const Menu = (props) => {
    return (
      <components.Menu {...props}>
        {props.children}
        <div
          style={{
            padding: "8px",
            borderTop: "1px solid #ccc",
            textAlign: "right",
          }}
        >
          <button
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              border: "none",
            }}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </components.Menu>
    );
  };
  return (
    <div>
    <Select
      isMulti
      value={isSelectAllSelected() ? [selectAllOption] : tempSelectedOptions}
      onChange={handleSelectChange}
      options={getAvailableOptions()}
      placeholder="Select options"
      closeMenuOnSelect={false}  
      components={{ Menu }}  
      menuIsOpen={menuIsOpen}  
      onMenuOpen={() => setMenuIsOpen(true)}  
      onMenuClose={() => setMenuIsOpen(false)}  
    />
    <div style={{ marginTop: '20px' }}>
      <strong>Selected Options:</strong> {selectedOptions.map(option => option.label).join(', ')}
    </div>
  </div>
  );
};

const FilterComponent = ({ onFilterChange }) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleDateChange = (ranges) => {
    setDateRange([ranges.selection]);
    onFilterChange({
      dateRange: {
        startDate: ranges.selection.startDate,
        endDate: ranges.selection.endDate,
      },
    });
  };

  return (
    <div>
      <h3>Date Range Picker</h3>
      {/* <DateRange
        editableDateInputs={true}
        onChange={handleDateChange}
        moveRangeOnFirstSelection={false}
        ranges={dateRange}
      /> */}
      <ReactMultiSeclect />
    </div>
  );
};

export default FilterComponent;
