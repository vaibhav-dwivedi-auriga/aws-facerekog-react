import React, { useState, useEffect } from "react";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { ThemeProvider, Loader } from "@aws-amplify/ui-react";
import { ToastContainer, toast } from 'react-toastify';

export function LivenessComponent() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const awsConfig = {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region:'us-east-1'
  }
  const baseUrl = "https://aws-facerekog-react-backend.vercel.app"
  const toastConfig = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  }

  

  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/create-liveness-session`);
        const data = await response.json();
        setSessionId(data.sessionId);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching session ID:", error);
      }
    };

    fetchSessionId();
  }, []);

  const handleAnalysisComplete = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/get-liveness-results?sessionId=${sessionId}`);
      const data = await response.json();
      console.log(data);
      const requestPayload = {
        sessionId
      }
      window.parent.postMessage(
        { type: "api-response-liveness-results", payload: { request: requestPayload, response: data } },
        "*"
      );

      if (data.isLive) {
        console.log("User is live");
        toast.success('User is live!',toastConfig);
        // 
        setTimeout(()=>window.location.reload(),3500);
      } else {
        console.log("User is not live");
        toast.error('User is not live!', toastConfig);
      setTimeout(()=>window.location.reload(),3500);

      }
    } catch (error) {
      console.error("Error getting liveness results:", error);
    }
  };

  return (
    <div className="detector-container">
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <>
        <FaceLivenessDetector
          sessionId={sessionId}
          region="us-east-1"
          onAnalysisComplete={handleAnalysisComplete}
          config={{
            credentialProvider: async () => awsConfig,
          }}
          onError={(error) => {
            console.error(error);
            window.location.reload()
          }}
        />
        <ToastContainer/>
        </>
      )}
    </ThemeProvider>
    </div>
  );
}
