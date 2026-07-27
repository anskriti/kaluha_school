import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLMarqueeElement>, HTMLMarqueeElement> & {
        direction?: string;
        scrollamount?: string;
        onMouseOver?: React.MouseEventHandler<HTMLMarqueeElement>;
        onMouseOut?: React.MouseEventHandler<HTMLMarqueeElement>;
      };
    }
  }
}
