import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

export function CloseButton({ onClick, style }) {
  style = Object.assign({ position: 'absolute', top: '6px', right: '6px' }, style);
  return (
    <IconButton style={style} color="secondary" onClick={onClick}>
      <CloseIcon />
    </IconButton>
  );
}
