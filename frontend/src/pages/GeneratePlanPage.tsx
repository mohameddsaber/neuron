import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GenerateProgramPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // User Profile
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    sleep_hours_per_night: "",
    
    // Goals
    primary_goal: "",
    target_weight_kg: "",
    goal_timeframe_weeks: "",
    
    // Experience
    training_experience_years: "",
    exercise_knowledge: "",
    previous_injuries: "",
    
    // Schedule
    workout_days_per_week: "",
    available_time_per_session_minutes: "",
    
    // Preferences
    preferred_training_style: [],
    disliked_exercises: "",
    enjoys_cardio: "",
    
    // Equipment
    training_location: "",
    available_equipment: [],
    
    // Output Preferences
    plan_duration_weeks: "",
    include_nutrition_guidelines: true,
  });
  const [messages, setMessages] = useState([]);
  const [success, setSuccess] = useState(false);
  const messageContainerRef = useRef(null);

  // Scroll message panel to bottom when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Redirect after success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [success]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  // Handle multi-select checkboxes
  const handleArrayChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessages([{ role: "system", content: "Generating your personalized plan..." }]);

    try {
      // Transform form data to match backend expectations
      const payload = {
        user_profile: {
          age: parseInt(formData.age),
          gender: formData.gender,
          height_cm: parseFloat(formData.height_cm),
          weight_kg: parseFloat(formData.weight_kg),
          activity_level: formData.activity_level,
          sleep_hours_per_night: parseFloat(formData.sleep_hours_per_night),
        },
        goals: {
          primary_goal: formData.primary_goal,
          target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
          goal_timeframe_weeks: formData.goal_timeframe_weeks ? parseInt(formData.goal_timeframe_weeks) : null,
        },
        experience: {
          training_experience_years: parseFloat(formData.training_experience_years),
          exercise_knowledge: formData.exercise_knowledge,
          previous_injuries: formData.previous_injuries ? formData.previous_injuries.split(",").map(s => s.trim()) : [],
        },
        schedule: {
          workout_days_per_week: parseInt(formData.workout_days_per_week),
          available_time_per_session_minutes: parseInt(formData.available_time_per_session_minutes),
        },
        preferences: {
          preferred_training_style: formData.preferred_training_style,
          disliked_exercises: formData.disliked_exercises ? formData.disliked_exercises.split(",").map(s => s.trim()) : [],
          // Note: The form uses a string select for enjoys_cardio ("yes"/"no") which is correctly converted to a boolean here.
          enjoys_cardio: formData.enjoys_cardio === "yes", 
        },
        equipment: {
          training_location: formData.training_location,
          available_equipment: formData.available_equipment,
        },
        output_preferences: {
          plan_duration_weeks: parseInt(formData.plan_duration_weeks),
          include_nutrition_guidelines: formData.include_nutrition_guidelines,
        },
      };

      const res = await fetch("http://localhost:4000/api/fitness/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate program");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "Your plan has been created!" },
      ]);
      setSuccess(true);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "error", content: error.message || "Something went wrong" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-primary uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Fill out a few details to create your personalized fitness and diet plan.
          </p>
        </div>

        {/* Layout: AI + Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI Assistant Card */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              <div className="relative size-32 mb-4">
                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                  <img
                    src="/avatar.JPG"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">CodeFlex AI</h2>
              <p className="text-sm text-muted-foreground mt-1">Fitness & Diet Coach</p>
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  {isSubmitting
                    ? "Generating plan..."
                    : success
                    ? "Plan ready!"
                    : `Step ${currentStep} of 5`}
                </span>
              </div>
            </div>
          </Card>

          {/* Form Card */}
          <Card className="bg-card/90 backdrop-blur-sm border overflow-hidden relative">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 max-h-[500px] overflow-y-auto">
              {/* Step 1: User Profile */}
              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Step 1: Your Profile
                  </h2>

                  <Input
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  <Input
                    name="height_cm"
                    type="number"
                    placeholder="Height (cm)"
                    value={formData.height_cm}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    name="weight_kg"
                    type="number"
                    placeholder="Weight (kg)"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    required
                  />

                  <select
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                  </select>

                  <Input
                    name="sleep_hours_per_night"
                    type="number"
                    step="0.5"
                    placeholder="Sleep hours per night"
                    value={formData.sleep_hours_per_night}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              {/* Step 2: Goals */}
              {currentStep === 2 && (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Step 2: Your Goals
                  </h2>

                  <select
                    name="primary_goal"
                    value={formData.primary_goal}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Primary Goal</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="strength">Strength</option>
                    <option value="endurance">Endurance</option>
                    <option value="general_fitness">General Fitness</option>
                  </select>

                  <Input
                    name="target_weight_kg"
                    type="number"
                    placeholder="Target weight (kg) - Optional"
                    value={formData.target_weight_kg}
                    onChange={handleChange}
                  />

                  <Input
                    name="goal_timeframe_weeks"
                    type="number"
                    placeholder="Goal timeframe (weeks) - Optional"
                    value={formData.goal_timeframe_weeks}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* Step 3: Experience & Schedule */}
              {currentStep === 3 && (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Step 3: Experience & Schedule
                  </h2>

                  <Input
                    name="training_experience_years"
                    type="number"
                    step="0.5"
                    placeholder="Training experience (years)"
                    value={formData.training_experience_years}
                    onChange={handleChange}
                    required
                  />

                  <select
                    name="exercise_knowledge"
                    value={formData.exercise_knowledge}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Exercise Knowledge</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>

                  <Textarea
                    name="previous_injuries"
                    placeholder="Previous injuries (comma-separated, e.g., knee pain, shoulder injury)"
                    value={formData.previous_injuries}
                    onChange={handleChange}
                    rows={2}
                  />

                  <Input
                    name="workout_days_per_week"
                    type="number"
                    placeholder="Workout days per week"
                    value={formData.workout_days_per_week}
                    onChange={handleChange}
                    required
                    min="1"
                    max="7"
                  />

                  <Input
                    name="available_time_per_session_minutes"
                    type="number"
                    placeholder="Available time per session (minutes)"
                    value={formData.available_time_per_session_minutes}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              {/* Step 4: Preferences & Equipment */}
              {currentStep === 4 && (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Step 4: Preferences & Equipment
                  </h2>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Training Style:</label>
                    {["full_body", "split", "hiit", "push_pull_legs"].map(style => (
                      <label key={style} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.preferred_training_style.includes(style)}
                          onChange={() => handleArrayChange("preferred_training_style", style)}
                          className="rounded"
                        />
                        {style.replace(/_/g, " ").toUpperCase()}
                      </label>
                    ))}
                  </div>

                  <Textarea
                    name="disliked_exercises"
                    placeholder="Disliked exercises (comma-separated)"
                    value={formData.disliked_exercises}
                    onChange={handleChange}
                    rows={2}
                  />

                  <select
                    name="enjoys_cardio"
                    value={formData.enjoys_cardio}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Do you enjoy cardio?</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>

                  <select
                    name="training_location"
                    value={formData.training_location}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Training Location</option>
                    <option value="gym">Gym</option>
                    <option value="home">Home</option>
                    <option value="outdoor">Outdoor</option>
                  </select>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Equipment:</label>
                    {["dumbbells", "resistance_bands", "barbell", "kettlebells", "machines", "bodyweight"].map(equip => (
                      <label key={equip} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.available_equipment.includes(equip)}
                          onChange={() => handleArrayChange("available_equipment", equip)}
                          className="rounded"
                        />
                        {equip.replace(/_/g, " ").toUpperCase()}
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* Step 5: Output Preferences */}
              {currentStep === 5 && (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Step 5: Plan Duration
                  </h2>

                  <Input
                    name="plan_duration_weeks"
                    type="number"
                    placeholder="Plan duration (weeks)"
                    value={formData.plan_duration_weeks}
                    onChange={handleChange}
                    required
                    min="1"
                  />

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="include_nutrition_guidelines"
                      checked={formData.include_nutrition_guidelines}
                      onChange={handleChange}
                      className="rounded"
                    />
                    Include nutrition guidelines
                  </label>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-2 mt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Generating..." : "Generate Program"}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Message Log */}
        {messages.length > 0 && (
          <div
            ref={messageContainerRef}
            className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300"
          >
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-muted-foreground mb-1">
                    {msg.role === "assistant"
                      ? "CodeFlex AI"
                      : msg.role === "error"
                      ? "Error"
                      : "System"}
                    :
                  </div>
                  <p
                    className={`text-sm ${
                      msg.role === "error"
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              ))}

              {success && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-primary mb-1">System:</div>
                  <p className="text-foreground">
                    Your fitness program has been created! Redirecting to your profile...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateProgramPage;