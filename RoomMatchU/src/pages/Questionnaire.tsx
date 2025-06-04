import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserQuestionnaire, PriorityLevel, QuestionnaireCategory } from '../types/index';
import { postQuestionnaire } from '../firebase/firebaseHelpers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const initialForm: UserQuestionnaire = {
  lifestyle: [],
  cleanliness: '',
  noiseLevel: '',
  sleepSchedule: '',
  visitors: '',
  sharing: [],
  Hobbies: [],
  fullname: [],
  Major: [],
  yearlvl: '',
  Gender: '',
  wakeupSchedule: '',
  roommateCleanliness: '',
  okvisitors: '',
  overnightGuests: '',
  studySpot: '',
  pets: '',
  okPets: '',
  prefGender: '',
  dealMust: [],
  maxDistanceFromCampus: undefined,
  priorities: {},
};

const PrioritySelector = ({
  category,
  label,
  value,
  onChange,
}: {
  category: QuestionnaireCategory;
  label: string;
  value: PriorityLevel | undefined;
  onChange: (category: QuestionnaireCategory, value: PriorityLevel) => void;
}) => (
  <div className="flex justify-between items-center mt-3 text-sm" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
    <span className="mr-2">{label} priority: </span>
    <select
      value={value || ''}
      onChange={(e) => onChange(category, e.target.value as PriorityLevel)}
      className="px-2 py-1 rounded-md"
    >
      <option value="">Select priority</option>
      <option value="Not Important">Not Important</option>
      <option value="Somewhat Important">Somewhat Important</option>
      <option value="Very Important">Very Important</option>
      <option value="Deal Breaker">Deal Breaker</option>
    </select>
  </div>
);

const steps = [
  'Personal Info',
  'Living Habits',
  'Guests',
  'Study Habits',
  'Pets',
  'Lifestyle',
  'Compatibility',
  'Finish'
];


const Questionnaire: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<UserQuestionnaire>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();


  const isLastStep = step === steps.length - 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (type === 'checkbox' && checked !== undefined) {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name as keyof UserQuestionnaire] as string[]), value]
          : (prev[name as keyof UserQuestionnaire] as string[]).filter((item) => item !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePriorityChange = (category: QuestionnaireCategory, value: PriorityLevel) => {
    setFormData((prev) => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [category]: value,
      },
    }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const missingFields: string[] = [];

    if (formData.fullname.length === 0) missingFields.push('full name');
    if (formData.Major.length === 0) missingFields.push('major');
    if (formData.yearlvl === '') missingFields.push('year level');
    if (formData.Gender === '') missingFields.push('gender');
    if (formData.sleepSchedule === '') missingFields.push('sleep schedule');
    if (formData.wakeupSchedule === '') missingFields.push('wake-up schedule');
    if (formData.cleanliness === '') missingFields.push('cleanliness');
    if (formData.roommateCleanliness === '') missingFields.push('roommate cleanliness');
    if (formData.noiseLevel === '') missingFields.push('noise level');
    if (formData.visitors === '') missingFields.push('visitor frequency');
    if (formData.okvisitors === '') missingFields.push('okay with visitors');
    if (formData.overnightGuests === '') missingFields.push('overnight guests');
    if (formData.studySpot === '') missingFields.push('study spot');
    if (formData.pets === '') missingFields.push('pets');
    if (formData.okPets === '') missingFields.push('okay with pets');
    if (formData.prefGender === '') missingFields.push('preferred roommate gender');
    if (formData.lifestyle.length === 0) missingFields.push('lifestyle');
    if (formData.sharing.length === 0) missingFields.push('about yourself');
    if (formData.Hobbies.length === 0) missingFields.push('hobbies');
    if (formData.dealMust.length === 0) missingFields.push('dealbreakers / must-haves');

    // Priorities
    if (!formData.priorities.sleepSchedule) missingFields.push('sleep schedule priority');
    if (!formData.priorities.wakeupSchedule) missingFields.push('wake-up schedule priority');
    if (!formData.priorities.cleanliness) missingFields.push('cleanliness priority');
    if (!formData.priorities.noiseLevel) missingFields.push('noise level priority');
    if (!formData.priorities.visitors) missingFields.push('visitor priority');
    if (!formData.priorities.pets) missingFields.push('pets priority');
    if (!formData.priorities.studyHabits) missingFields.push('study habits priority');
    if (!formData.priorities.lifestyle) missingFields.push('lifestyle priority');

    if (missingFields.length > 0) {
      toast.error(`🚨 Missing: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Clean the data
      const cleanedData = { ...formData };
      if (cleanedData.maxDistanceFromCampus === undefined) {
        delete cleanedData.maxDistanceFromCampus;
      }

      toast.success("🎉 Questionnaire submitted! Redirecting...");
      await postQuestionnaire(cleanedData);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast.error('❌ There was an error submitting your form. Please try again.');
    }

  };

  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="questionnaire-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h1 className="text-3xl font-bold text-center mb-6">Roommate Questionnaire</h1>
      
      <form noValidate style={{ width: '100%', maxWidth: '800px' }}>
        <div className="relative min-h-[250px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-0" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Personal Info</h2>
                {/*Full Name */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>What is your full name? </label>
                    <input
                      required
                      type="text"
                      name="fullname"
                      value={formData.fullname.join('\n')}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullname: e.target.value.split('\n'),
                        }))
                      }
                      className="w-full"
                      placeholder="Sammy S. Slug"
                    />
                </div>
                {/* Major */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>What are you majoring in? </label>
                    <input
                      required
                      type="text"
                      name="Major"
                      value={formData.Major.join('\n')}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          Major: e.target.value.split('\n'),
                        }))
                      }
                      className="w-full"
                      placeholder="Computer Science"
                    />
                </div>

                {/* Year in School */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>What year are you? </label>
                    <select
                    required
                    name="yearlvl"
                    value={formData.yearlvl}
                    onChange={handleChange}
                    className="w-full"
                    >
                    <option value="">Select an option</option>
                    <option>First Year</option>
                    <option>Second Year</option>
                    <option>Third Year</option>
                    <option>Fourth Year</option>
                    <option>Grad Student</option>
                    </select>
                </div>

                {/* Gender */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>What gender are you? </label>
                    <select
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    required
                    className="w-full"
                    >
                    <option value="">Select an option</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                    </select>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step-1" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Living Habits</h2>
                  {/* Sleep Schedule */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <label style={{ minWidth: '250px', marginRight: '15px' }}>When do you usually go to bed? </label>
                      <select
                        name="sleepSchedule"
                        value={formData.sleepSchedule}
                        onChange={handleChange}
                        required
                        className="w-full"
                      >
                        <option value="">Select an option</option>
                        <option>Before 10pm</option>
                        <option>10pm - 12am</option>
                        <option>After 12am</option>
                      </select>
                    </div>
                    <PrioritySelector 
                      category="sleepSchedule" 
                      label="Sleep schedule" 
                      value={formData.priorities.sleepSchedule} 
                      onChange={handlePriorityChange} 
                    />
                  </div>

                  {/* Wake up Schedule */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <label style={{ minWidth: '250px', marginRight: '15px' }}>When do you usually wake up? </label>
                      <select
                        name="wakeupSchedule"
                        value={formData.wakeupSchedule}
                        onChange={handleChange}
                        required
                        className="w-full"
                      >
                        <option value="">Select an option</option>
                        <option>Before 7am</option>
                        <option>7am - 9am</option>
                        <option>After 9am</option>
                      </select>
                    </div>
                    <PrioritySelector 
                      category="wakeupSchedule" 
                      label="Wake-up schedule" 
                      value={formData.priorities.wakeupSchedule} 
                      onChange={handlePriorityChange} 
                    />
                  </div>

                  {/* Cleanliness */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <label style={{ minWidth: '250px', marginRight: '15px' }}>How tidy are you? </label>
                      <select
                        name="cleanliness"
                        value={formData.cleanliness}
                        onChange={handleChange}
                        required
                        className="w-full"
                      >
                        <option value="">Select an option</option>
                        <option>Very tidy</option>
                        <option>Moderately tidy</option>
                        <option>Messy</option>
                      </select>
                    </div>
                    <PrioritySelector 
                      category="cleanliness" 
                      label="Cleanliness" 
                      value={formData.priorities.cleanliness} 
                      onChange={handlePriorityChange} 
                    />
                  </div>
                
                  {/* roommateCleanliness */}
                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>How important is cleanliness in a roomate? </label>
                    <select
                      name="roommateCleanliness"
                      value={formData.roommateCleanliness}
                      onChange={handleChange}
                      required
                      className="w-full"
                    >
                      <option value="">Select an option</option>
                      <option>Not Important</option>
                      <option>Somewhat Important</option>
                      <option>Very Important</option>
                    </select>
                  </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Guest Preferences</h2>
                {/* Visitors */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>How often do you have guests over? </label>
                    <select
                      name="visitors"
                      value={formData.visitors}
                      onChange={handleChange}
                      required
                      className="w-full"
                    >
                      <option value="">Select an option</option>
                      <option>Frequently</option>
                      <option>Occasionally</option>
                      <option>Rarely</option>
                      <option>Never</option>
                    </select>
                  </div>
                  <PrioritySelector 
                    category="visitors" 
                    label="Guest policy" 
                    value={formData.priorities.visitors} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* Okay with Visitors? */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <label style={{ minWidth: '250px', marginRight: '15px' }}>Are you okay with your roomate having guests over? </label>
                  <select
                    name="okvisitors"
                    value={formData.okvisitors}
                    onChange={handleChange}
                    required
                    className="w-full"
                  >
                    <option value="">Select an option</option>
                    <option>Yes</option>
                    <option>Occasionally</option>
                    <option>No</option>
                  </select>
                </div>

                {/* Overnight guests */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <label style={{ minWidth: '250px', marginRight: '15px' }}>Are overnight guests okay? </label>
                  <select
                    name="overnightGuests"
                    value={formData.overnightGuests}
                    onChange={handleChange}
                    required
                    className="w-full"
                  >
                    <option value="">Select an option</option>
                    <option>Yes</option>
                    <option>With Notice</option>
                    <option>No</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Study Habits</h2>
                {/* studySpot */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>Where do you prefer to study?</label>
                    <select
                      name="studySpot"
                      value={formData.studySpot}
                      onChange={handleChange}
                      required
                      className="w-full"
                    >
                      <option value="">Select an option</option>
                      <option>Home</option>
                      <option>Library</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <PrioritySelector 
                    category="studyHabits" 
                    label="Study habits" 
                    value={formData.priorities.studyHabits} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* Noise Level */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>Preferred noise level while studying/living?</label>
                    <select
                    name="noiseLevel"
                    value={formData.noiseLevel}
                    onChange={handleChange}
                    required
                    className="w-full"
                    >
                    <option value="">Select an option</option>
                    <option>Silent</option>
                    <option>Background noise/music</option>
                    <option>No preference</option>
                    </select>
                  </div>
                  <PrioritySelector 
                    category="noiseLevel" 
                    label="Noise level" 
                    value={formData.priorities.noiseLevel} 
                    onChange={handlePriorityChange} 
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Pets</h2>
                {/* pets? */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>Do you have any pets or plan to bring one? </label>
                    <select
                      name="pets"
                      value={formData.pets}
                      onChange={handleChange}
                      required
                      className="w-full"
                    >
                      <option value="">Select an option</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <PrioritySelector 
                    category="pets" 
                    label="Pet preferences" 
                    value={formData.priorities.pets} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* okPets */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <label style={{ minWidth: '250px', marginRight: '15px' }}>Are you okay living with animals(cats, dogs, etc.)? </label>
                  <select
                    name="okPets"
                    value={formData.okPets}
                    onChange={handleChange}
                    required
                    className="w-full"
                  >
                    <option value="">Select an option</option>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Other(allergies, certain animals, etc.)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step-5" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Lifestyle</h2>
                {/* Lifestyle (multiple) */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Which of these describe your lifestyle? (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[' Smokes ', ' Drinks ', ' Cooks often ', ' Vegetarian ', ' Stays up late ', ' Wakes up early '].map((item) => (
                      <label key={item} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          name="lifestyle"
                          value={item}
                          checked={formData.lifestyle.includes(item)}
                          onChange={handleChange}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{item.trim()}</span>
                      </label>
                    ))}
                  </div>
                  <PrioritySelector 
                    category="lifestyle" 
                    label="Lifestyle compatibility" 
                    value={formData.priorities.lifestyle} 
                    onChange={handlePriorityChange} 
                  />
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step-6" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Compatibility</h2>
                {/* Preffered Geneder Roommate */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <label style={{ minWidth: '250px', marginRight: '15px' }}>Preferred gender of roommate? </label>
                  <select
                  name="prefGender"
                  value={formData.prefGender}
                  onChange={handleChange}
                  required
                  className="w-full"
                  >
                  <option value="">Select an option</option>
                  <option>No Preference</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  </select>
                </div>

                {/* Max Distance from Campus */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ minWidth: '250px', marginRight: '15px' }}>
                      Maximum distance from UCSC campus (in miles)?
                    </label>
                    <input
                      type="text" // <-- change this from "number" to "text"
                      name="maxDistanceFromCampus"
                      inputMode="decimal" // allows numeric keyboard on mobile
                      value={formData.maxDistanceFromCampus !== undefined ? formData.maxDistanceFromCampus : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const numeric = raw === '' ? undefined : Number(raw);
                        setFormData((prev) => ({
                          ...prev,
                          maxDistanceFromCampus: numeric,
                        }));
                      }}
                      className="w-full"
                      placeholder="e.g. 5"
                    />
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', textAlign: 'center' }}>
                    Leave blank if distance doesn't matter
                  </p>
                </div>

                {/* Hobbies */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>What are some of your hobbies and interests? </label>
                  <textarea
                    name="Hobbies"
                    value={formData.Hobbies.join('\n')}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        Hobbies: e.target.value.split('\n'),
                      }))
                    }
                    className="w-full"
                    placeholder="I really like to go hiking"
                    rows={3}
                  />
                </div>

                {/* Dealbreakers or Must Haves */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>What are some dealbreakers or must-haves in a roommate? </label>
                  <textarea
                    name="dealMust"
                    value={formData.dealMust.join('\n')}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dealMust: e.target.value.split('\n'),
                      }))
                    }
                    className="w-full"
                    placeholder="I NEED a roommate who..."
                    rows={3}
                  />
                </div>

                {/* Sharing (open-ended) */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Tell us a little about yourself! </label>
                  <textarea
                    name="sharing"
                    value={formData.sharing.join('\n')}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sharing: e.target.value.split('\n'),
                      }))
                    }
                    className="w-full"
                    placeholder="Im from LA and..."
                    rows={4}
                  />
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="step-7" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Review & Submit</h2>
                <div className="text-center">
                  <div className="mb-8">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mb-2 text-lg">You're all set!</p>
                    <p className="text-sm">Double check your answers before submitting. We'll match you based on your inputs and priorities.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-10" style={{ maxWidth: '800px', margin: '40px auto 0' }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="px-6 py-2 font-semibold rounded-md disabled:opacity-50"
          >
            Back
          </button>

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 font-semibold rounded-md"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 font-semibold rounded-md"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Questionnaire;