import { useState } from "react";

const healthTopics = {
  diabetes: {
    title: "Diabetes",
    icon: "🩸",
    answer:
      "Diabetes is a condition in which blood glucose levels are higher than normal. Common symptoms can include increased thirst, frequent urination, tiredness, blurred vision, and unexplained weight changes. A healthcare professional can confirm diabetes using appropriate tests.",
    advice:
      "If you are concerned about diabetes, consider discussing your symptoms and testing options with a qualified healthcare professional.",
  },

  fever: {
    title: "Fever",
    icon: "🌡️",
    answer:
      "Fever is a temporary increase in body temperature and can happen with infections and other conditions. Rest, fluids, and monitoring your symptoms can be helpful for general care.",
    advice:
      "Seek medical advice if the fever is persistent, very high, repeatedly returning, or accompanied by concerning symptoms.",
  },

  cold: {
    title: "Common Cold",
    icon: "🤧",
    answer:
      "A common cold is usually a mild viral infection. Symptoms can include a runny or blocked nose, sneezing, sore throat, cough, and mild tiredness.",
    advice:
      "Most uncomplicated colds improve with time. Consult a healthcare professional if symptoms are severe, persistent, or getting worse.",
  },

  headache: {
    title: "Headache",
    icon: "🤕",
    answer:
      "Headaches can have many causes, including stress, lack of sleep, dehydration, eye strain, or infections. The type, duration, and accompanying symptoms are important when assessing a headache.",
    advice:
      "A new, severe, sudden, or unusual headache should be assessed by a healthcare professional.",
  },

  acidity: {
    title: "Acidity / Heartburn",
    icon: "🔥",
    answer:
      "Acidity or heartburn can cause a burning sensation in the chest or upper abdomen, often after eating. Some people also experience a sour taste or discomfort when lying down.",
    advice:
      "Frequent or persistent symptoms should be discussed with a healthcare professional because several conditions can cause similar symptoms.",
  },

  cough: {
    title: "Cough",
    icon: "😷",
    answer:
      "A cough is a natural reflex that helps clear the throat and airways. It can occur with colds, allergies, infections, asthma, and other conditions.",
    advice:
      "Consult a healthcare professional if the cough is persistent, severe, associated with breathing difficulty, chest pain, or coughing up blood.",
  },

  allergy: {
    title: "Allergies",
    icon: "🤧",
    answer:
      "Allergies happen when the immune system reacts to a substance such as pollen, dust, certain foods, or other triggers. Symptoms can include sneezing, itching, watery eyes, or skin reactions.",
    advice:
      "If there is swelling of the face or throat, difficulty breathing, or a rapidly worsening reaction, seek emergency medical care immediately.",
  },

  bloodPressure: {
    title: "Blood Pressure",
    icon: "❤️",
    answer:
      "Blood pressure measures the force of blood against the walls of your arteries. High blood pressure often has no obvious symptoms, which is why regular measurement can be important.",
    advice:
      "If you have concerns about your blood pressure or repeatedly get unusual readings, discuss them with a healthcare professional.",
  },

  stomachPain: {
    title: "Stomach Pain",
    icon: "🩺",
    answer:
      "Stomach or abdominal pain can have many causes, ranging from digestive problems to conditions that require medical assessment. The location, severity, duration, and accompanying symptoms are important.",
    advice:
      "Severe, sudden, persistent, or worsening abdominal pain should be assessed by a healthcare professional.",
  },

  skin: {
    title: "Skin Problems",
    icon: "🧴",
    answer:
      "Common skin concerns can include dryness, irritation, acne, rashes, and allergic reactions. Different skin conditions can look similar, so identifying the exact cause may require professional assessment.",
    advice:
      "Consult a healthcare professional if a rash is severe, rapidly spreading, painful, infected-looking, or persistent.",
  },
};

const emergencyKeywords = [
  "chest pain",
  "severe chest pain",
  "difficulty breathing",
  "cannot breathe",
  "can't breathe",
  "shortness of breath",
  "unconscious",
  "fainted",
  "severe bleeding",
  "heavy bleeding",
  "coughing blood",
  "vomiting blood",
  "blood vomit",
  "stroke",
  "face drooping",
  "weakness on one side",
  "slurred speech",
  "seizure",
  "convulsion",
  "suicide",
  "self harm",
  "loss of consciousness",
];

const seriousKeywords = [
  "severe pain",
  "very high fever",
  "persistent fever",
  "blood in stool",
  "black stool",
  "severe headache",
  "sudden headache",
  "persistent vomiting",
  "dehydration",
  "confusion",
  "difficulty swallowing",
  "swelling of throat",
  "swollen throat",
  "severe allergic reaction",
];

function HealthAssistant() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);

  const findHealthTopic = (text) => {
    if (
      text.includes("diabetes") ||
      text.includes("blood sugar") ||
      text.includes("sugar disease")
    ) {
      return healthTopics.diabetes;
    }

    if (
      text.includes("fever") ||
      text.includes("temperature") ||
      text.includes("high temperature")
    ) {
      return healthTopics.fever;
    }

    if (
      text.includes("cold") ||
      text.includes("runny nose") ||
      text.includes("blocked nose") ||
      text.includes("sneezing")
    ) {
      return healthTopics.cold;
    }

    if (
      text.includes("headache") ||
      text.includes("head pain") ||
      text.includes("head ache")
    ) {
      return healthTopics.headache;
    }

    if (
      text.includes("acidity") ||
      text.includes("heartburn") ||
      text.includes("gastric") ||
      text.includes("acid reflux")
    ) {
      return healthTopics.acidity;
    }

    if (
      text.includes("cough") ||
      text.includes("coughing")
    ) {
      return healthTopics.cough;
    }

    if (
      text.includes("allergy") ||
      text.includes("allergic") ||
      text.includes("itching") ||
      text.includes("sneezing")
    ) {
      return healthTopics.allergy;
    }

    if (
      text.includes("blood pressure") ||
      text.includes("bp")
    ) {
      return healthTopics.bloodPressure;
    }

    if (
      text.includes("stomach pain") ||
      text.includes("abdominal pain") ||
      text.includes("belly pain") ||
      text.includes("stomach ache")
    ) {
      return healthTopics.stomachPain;
    }

    if (
      text.includes("skin") ||
      text.includes("rash") ||
      text.includes("acne") ||
      text.includes("dry skin")
    ) {
      return healthTopics.skin;
    }

    return null;
  };

  const handleAsk = () => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setResponse({
        type: "empty",
        title: "Ask a health question",
        message:
          "Please enter a question such as “What are common symptoms of diabetes?”",
      });
      return;
    }

    const lowerQuestion = cleanQuestion.toLowerCase();

    const isEmergency = emergencyKeywords.some((keyword) =>
      lowerQuestion.includes(keyword),
    );

    if (isEmergency) {
      setResponse({
        type: "emergency",
        title: "Please seek urgent medical care",
        message:
          "The symptoms you described may require urgent medical attention. Please contact your local emergency service or go to the nearest emergency department. Do not rely on this assistant for emergency diagnosis or treatment.",
      });

      return;
    }

    const isSerious = seriousKeywords.some((keyword) =>
      lowerQuestion.includes(keyword),
    );

    const topic = findHealthTopic(lowerQuestion);

    if (isSerious) {
      setResponse({
        type: "serious",
        title: topic ? topic.title : "Medical attention may be needed",
        icon: topic ? topic.icon : "⚠️",
        answer: topic
          ? topic.answer
          : "The symptom you described can have different causes and may require an examination or testing.",
        advice:
          "Because you mentioned a potentially concerning symptom, please consult a qualified healthcare professional, especially if the symptom is severe, persistent, or getting worse.",
      });

      return;
    }

    if (topic) {
      setResponse({
        type: "normal",
        ...topic,
      });

      return;
    }

    setResponse({
      type: "unknown",
      title: "Let's keep your health safe",
      icon: "🩺",
      answer:
        "I can provide general information about common health topics such as diabetes, fever, cold, cough, headache, acidity, allergies, blood pressure, stomach pain, and common skin concerns.",
      advice:
        "For a specific or ongoing health problem, a qualified healthcare professional can provide advice based on your symptoms and medical history.",
    });
  };

  const handleExampleClick = (example) => {
    setQuestion(example);
  };

  const clearAssistant = () => {
    setQuestion("");
    setResponse(null);
  };

  return (
    <section className="health-assistant-section container">
      {/* HEADER */}
      <div className="health-assistant-header text-center">
        <div className="health-assistant-main-icon">🩺</div>

        <h2 className="section-title">Ask Anything About Your Health</h2>

        <p className="section-description">
          Get simple health information and guidance for common health
          questions.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="health-assistant-card">
        <div className="health-assistant-trust">
          <span>🔒</span>
          <span>General health information</span>

          <span className="health-trust-divider">•</span>

          <span>👨‍⚕️ Not a diagnosis</span>
        </div>

        {/* SEARCH */}
        <div className="health-question-box">
          <label htmlFor="healthQuestion">
            What would you like to know?
          </label>

          <div className="health-input-group">
            <input
              id="healthQuestion"
              type="text"
              className="form-control"
              placeholder="Example: What are common symptoms of diabetes?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAsk();
                }
              }}
            />

            <button
              type="button"
              className="btn btn-primary health-ask-btn"
              onClick={handleAsk}
            >
              Ask
            </button>
          </div>
        </div>

        {/* EXAMPLES */}
        <div className="health-examples">
          <span>Try asking:</span>

          <button
            type="button"
            onClick={() =>
              handleExampleClick("What are common symptoms of diabetes?")
            }
          >
            Diabetes symptoms
          </button>

          <button
            type="button"
            onClick={() =>
              handleExampleClick("What are common causes of headache?")
            }
          >
            Headache
          </button>

          <button
            type="button"
            onClick={() =>
              handleExampleClick("What are common symptoms of acidity?")
            }
          >
            Acidity
          </button>

          <button
            type="button"
            onClick={() =>
              handleExampleClick("What is common cold?")
            }
          >
            Common cold
          </button>
        </div>

        {/* RESPONSE */}
        {response && (
          <div
            className={`health-response ${
              response.type === "emergency"
                ? "emergency"
                : response.type === "serious"
                  ? "serious"
                  : ""
            }`}
          >
            <div className="health-response-header">
              <div className="health-response-icon">
                {response.icon || "🩺"}
              </div>

              <div>
                <h4>{response.title}</h4>

                {response.type === "normal" && (
                  <span className="health-general-label">
                    General information
                  </span>
                )}

                {response.type === "serious" && (
                  <span className="health-warning-label">
                    Medical attention recommended
                  </span>
                )}

                {response.type === "emergency" && (
                  <span className="health-emergency-label">
                    Urgent attention
                  </span>
                )}
              </div>
            </div>

            {response.message && (
              <p className="health-response-message">
                {response.message}
              </p>
            )}

            {response.answer && (
              <div className="health-answer">
                <h5>What you should know</h5>

                <p>{response.answer}</p>
              </div>
            )}

            {response.advice && (
              <div className="health-advice">
                <strong>👨‍⚕️ When to get professional help</strong>

                <p>{response.advice}</p>
              </div>
            )}

            <div className="health-disclaimer">
              <strong>Important:</strong> This assistant provides general
              health information only. It cannot diagnose a disease or replace
              a qualified healthcare professional.
            </div>

            <button
              type="button"
              className="health-clear-btn"
              onClick={clearAssistant}
            >
              ✕ Ask another question
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default HealthAssistant;