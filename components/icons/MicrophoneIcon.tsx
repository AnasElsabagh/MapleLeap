
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const MicrophoneIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12.75V18.75m0 0H9.75m2.25 0H14.25M12 12.75A3 3 0 0015 9.75V6.75a3 3 0 00-6 0v3a3 3 0 003 3z"
    />
  </svg>
);

export default MicrophoneIcon;
