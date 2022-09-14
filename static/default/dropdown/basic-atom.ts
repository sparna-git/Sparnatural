import * as COLORS from "./colors";

export default `
  .basic-atom {
    box-sizing: border-box;
    position: relative;
    border: 1px solid ${COLORS.trgrey2.hex};
    background: ${COLORS.trwhite.hex};
    box-shadow: 0 2px 4px 0 rgba(${COLORS.trblack.rgb}, 0.05), 0 2px 8px 0 rgba(${COLORS.trgrey2.rgb}, 0.4);
    color: ${COLORS.trgrey3.hex};
    cursor: pointer;
  }

  .basic-atom:focus {
    border: 1px solid ${COLORS.trblue2.hex};
    box-shadow: 0 2px 4px 0 rgba(${COLORS.trgrey2.rgb}, 0.4), 0 2px 8px 0 rgba(${COLORS.trblack.rgb}, 0.05), inset 0 0 0 1px ${COLORS.trblue2.hex};
  }

  .basic-atom.selected {
    border-color: ${COLORS.trblue2.hex};
    background: rgba(${COLORS.trblue0.rgb}, 0.4);
    box-shadow: 0 2px 8px 0 rgba(${COLORS.trblue2.rgb}, 0.25);
    color: ${COLORS.trblue4.hex};
  }

  .basic-atom.selected:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    box-shadow: 0 2px 8px 0 rgba(${COLORS.trblue2.rgb}, 0.25);
  }

  .basic-atom.selected:hover,
  .basic-atom.selected:focus {
    box-shadow: 0 2px 8px 0 rgba(${COLORS.trblue2.rgb}, 0.25);
  }

  .basic-atom:hover {
    border-color: ${COLORS.trblue2.hex};
    color: ${COLORS.trblue3.hex};
  }

  .basic-atom:active {
    border: 1px solid ${COLORS.trblue2.hex};
    background: rgba(${COLORS.trblue2.rgb}, 0.1);
    color: ${COLORS.trblue3.hex};
    box-shadow: none;
  }

  .basic-atom:disabled {
    border-color: rgba(${COLORS.trgrey2.rgb}, 0.25);
    box-shadow: none;
    color: rgba(${COLORS.trgrey3.rgb}, 0.75);
    font-weight: normal;
    pointer-events: none;

  }

  .basic-atom:disabled .icon {
    color: ${COLORS.trgrey5.hex};
  }
`;
