import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg";

const UserRoadsideIcon = (props: SvgProps) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color="#000000" fill="none" {...props}>
    <Path d="M12.9981 6.5H11.0019C8.13196 6.5 6.19701 9.56909 7.32753 12.328C7.48501 12.7124 7.84633 12.9615 8.24612 12.9615H8.9491C9.18605 12.9615 9.39259 13.1302 9.45006 13.3706L10.3551 17.1567C10.5438 17.9462 11.222 18.5 12 18.5C12.778 18.5 13.4562 17.9462 13.6449 17.1567L14.5499 13.3706C14.6074 13.1302 14.814 12.9615 15.0509 12.9615H15.7539C16.1537 12.9615 16.515 12.7124 16.6725 12.328C17.803 9.56909 15.868 6.5 12.9981 6.5Z" stroke="currentColor" strokeWidth="1.5" />
    <Path d="M14.5 4C14.5 5.38071 13.3807 6.5 12 6.5C10.6193 6.5 9.5 5.38071 9.5 4C9.5 2.61929 10.6193 1.5 12 1.5C13.3807 1.5 14.5 2.61929 14.5 4Z" stroke="currentColor" strokeWidth="1.5" />
    <Path d="M7 16.5L6 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 21.5L12 22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 16.5L17 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default UserRoadsideIcon;
