import React, { FunctionComponent } from "react";
import { Link, Typography } from "@material-ui/core";

const Copyright: FunctionComponent = () => (
  <Typography variant="body2" color="textSecondary" align="center" className="mt-5">
    Satyrn is a data exploration platform being developed by the <Link color="inherit" href="https://c3lab.northwestern.edu/"><strong>C3 Lab @ Northwestern University</strong></Link>.<br />
    <Link color="inherit" href="https://scales-okn.org/"><strong>SCALES - OKN</strong></Link> is an interdisciplinary project aimed at expanding access to court records and analytics.
 
    
    <br />
  </Typography>
);

export default Copyright;
