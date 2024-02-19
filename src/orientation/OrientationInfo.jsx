import React from 'react';
import { useDeviceOrientation } from './useDeviceOrientation';

function OrientationInfo () {
  const { orientation, requestAccess, revokeAccess, error } = useDeviceOrientation();

  const orientationInfo = orientation && (
    <ul>
      <li>ɑ: <code>{orientation.alpha}</code></li>
      <li>β: <code>{orientation.beta}</code></li>
      <li>γ: <code>{orientation.gamma}</code></li>
    </ul>
  );

  const errorElement = error ? (
    <div className="error">{error.message}</div>
  ) : null;

  return (
    <>
      {orientationInfo}
      {errorElement}
    </>
  );
}

export default OrientationInfo;
