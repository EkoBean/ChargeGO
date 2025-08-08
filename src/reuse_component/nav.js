import React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function NavBar() {
  return /*#__PURE__*/_jsx("nav", {
    children: /*#__PURE__*/_jsxs("ul", {
      className: "nav justify-content-center",
      children: [/*#__PURE__*/_jsx("li", {
        className: "nav-item",
        children: /*#__PURE__*/_jsx("a", {
          className: "nav-link active",
          href: "#",
          "aria-current": "page",
          children: "Active link"
        })
      }), /*#__PURE__*/_jsx("li", {
        className: "nav-item",
        children: /*#__PURE__*/_jsx("a", {
          className: "nav-link",
          href: "#",
          children: "Link"
        })
      }), /*#__PURE__*/_jsx("li", {
        className: "nav-item",
        children: /*#__PURE__*/_jsx("a", {
          className: "nav-link disabled",
          href: "#",
          children: "Disabled link"
        })
      })]
    })
  });
}
export default NavBar;