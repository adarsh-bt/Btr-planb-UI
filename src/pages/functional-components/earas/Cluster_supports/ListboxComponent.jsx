import React from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList } from 'react-window';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Typography } from '@mui/material'; // Added for consistent rendering of option groups
import Box from '@mui/material/Box'; // Added for consistent rendering of option groups

// Adjust this padding based on your theme/design if MenuItems have extra padding
const LISTBOX_PADDING = 8; // px - this is for the top and bottom padding of the listbox

// Helper function to adjust style for individual row
function getRowStyle(style, index, data) {
  // Autocomplete children include separators or group headers, which we don't want to offset
  const isGroupHeader = data[index][0] === null; // Check if it's a group header (first item in data array is null for group headers)
  return {
    ...style,
    top: style.top + (isGroupHeader ? 0 : LISTBOX_PADDING), // Apply padding offset only to actual items
  };
}

// Renders each individual row (option) in the virtualized list
const renderRow = (props) => {
  const { data, index, style } = props;
  const dataSet = data[index]; // dataSet[0] contains props for the li, dataSet[1] contains the actual option element

  // If it's a group header, render it directly without the padding offset
  if (dataSet[0] === null) {
      return (
          <li style={style} {...dataSet[2]}> {/* dataSet[2] has the group header props */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1, backgroundColor: '#f0f0f0' }}>
                  {dataSet[1]} {/* Group header text */}
              </Typography>
          </li>
      );
  }

  // For regular options (MenuItem equivalent)
  return (
    <li {...dataSet[0]} style={getRowStyle(style, index, data)}>
      {dataSet[1]} {/* The actual React element (e.g., span with option text) */}
    </li>
  );
};

// The main ListboxComponent that wraps FixedSizeList
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = []; // Stores the [props, element] pairs for FixedSizeList
  let itemCounter = 0; // To track original index for key generation

  // Autocomplete children are an array where each item is either a MenuItem or an HTML element for group headers.
  // We need to transform them into a format suitable for react-window's itemData.
  React.Children.forEach(children, (item) => {
      if (item && item.props && item.props.hasOwnProperty('group')) { // It's an option group header
          itemData.push([
              null, // Use null to indicate it's a group header, not a selectable option
              item.props.group, // The group name
              item.props.ownerState // Autocomplete passes ownerState for group headers
          ]);
      } else if (React.isValidElement(item)) {
          // For actual options, store its props and the element itself
          itemData.push([item.props, item]);
      }
      itemCounter++;
  });


  const theme = useTheme();
  // Adjust itemSize based on your MenuItem height in Material-UI
  // Standard MenuItem height is typically 48px, but can vary.
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const itemSize = smUp ? 48 : 56; // Standard Material-UI MenuItem height for desktop vs mobile

  const itemCount = itemData.length;
  // Calculate the height of the listbox - show max 8 items, but don't exceed total item height
  const listboxHeight = Math.min(itemCount * itemSize, itemSize * 8); // Max 8 items visible

  return (
    <Box ref={ref} {...other}> {/* Use Box for better styling and ref handling */}
      <FixedSizeList
        height={listboxHeight}
        width="auto" // Will take full width of parent
        itemCount={itemCount}
        itemSize={itemSize}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items above and below the visible area for smoother scrolling
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

export default ListboxComponent;