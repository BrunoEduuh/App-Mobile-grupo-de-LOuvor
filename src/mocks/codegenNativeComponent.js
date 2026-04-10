import React from 'react';

export default function codegenNativeComponent(name) {
  return (props) => {
    // No web-specific View import to avoid circular dependencies
    // Just return children or a simple div-like structure
    return props.children || null;
  };
}
