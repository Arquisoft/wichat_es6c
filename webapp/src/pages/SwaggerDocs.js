import React from "react";

const SwaggerDocs = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="http://localhost:8000/api-doc"
        title="API Documentation"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
};

export default SwaggerDocs;
