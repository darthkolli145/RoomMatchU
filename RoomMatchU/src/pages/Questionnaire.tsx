import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserQuestionnaire, PriorityLevel, QuestionnaireCategory } from '../types/index';

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
  <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
    <span className="mr-2">{label} priority: </span>
    <select
      value={value || ''}
      onChange={(e) => onChange(category, e.target.value as PriorityLevel)}
      className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="questionnaire-page">
      <h1 className="text-3xl font-bold text-purple-700 text-center mb-4">Roommate Questionnaire</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="relative min-h-[250px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-0" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Personal Info</h2>
                {/*Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What is your full name? </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname.join('\n')}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullname: e.target.value.split('\n'),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Sammy S. Slug"
                    />
                </div>
                {/* Major */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What are you majoring in? </label>
                    <input
                      type="text"
                      name="Major"
                      value={formData.Major.join('\n')}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          Major: e.target.value.split('\n'),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Computer Science"
                    />
                </div>

                {/* Year in School */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What year are you? </label>
                    <select
                    name="yearlvl"
                    value={formData.yearlvl}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
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
                <div>
                    <label className="block font-medium mb-1 text-indigo-600">What gender are you? </label>
                    <select
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
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
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Living Habits</h2>
                  {/* Sleep Schedule */}
                  <div>
                    <label className="block font-medium mb-1 text-indigo-600">When do you usually go to bed? </label>
                    <select
                      name="sleepSchedule"
                      value={formData.sleepSchedule}
                      onChange={handleChange}
                      required
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select an option</option>
                      <option>Before 10pm</option>
                      <option>10pm - 12am</option>
                      <option>After 12am</option>
                    </select>
                    <PrioritySelector 
                      category="sleepSchedule" 
                      label="Sleep schedule" 
                      value={formData.priorities.sleepSchedule} 
                      onChange={handlePriorityChange} 
                    />
                  </div>

                  {/* Wake up Schedule */}
                  <div>
                    <label className="block font-medium mb-1 text-indigo-600">When do you usually wake up? </label>
                    <select
                      name="wakeupSchedule"
                      value={formData.wakeupSchedule}
                      onChange={handleChange}
                      required
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select an option</option>
                      <option>Before 7am</option>
                      <option>7am - 9am</option>
                      <option>After 9am</option>
                    </select>
                    <PrioritySelector 
                      category="wakeupSchedule" 
                      label="Wake-up schedule" 
                      value={formData.priorities.wakeupSchedule} 
                      onChange={handlePriorityChange} 
                    />
                  </div>

                  {/* Cleanliness */}
                  <div>
                    <label className="block font-medium mb-1 text-indigo-600">How tidy are you? </label>
                    <select
                      name="cleanliness"
                      value={formData.cleanliness}
                      onChange={handleChange}
                      required
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select an option</option>
                      <option>Very tidy</option>
                      <option>Moderately tidy</option>
                      <option>Messy</option>
                    </select>
                    <PrioritySelector 
                      category="cleanliness" 
                      label="Cleanliness" 
                      value={formData.priorities.cleanliness} 
                      onChange={handlePriorityChange} 
                    />
                  </div>
                
                  {/* roommateCleanliness */}
                  <div>
                    <label className="block font-medium mb-1 text-indigo-600">How important is cleanliness in a roomate? </label>
                    <select
                      name="roommateCleanliness"
                      value={formData.roommateCleanliness}
                      onChange={handleChange}
                      required
                      className="w-full border rounded p-2"
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
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Guest Preferences</h2>
                {/* Visitors */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">How often do you have guests over? </label>
                  <select
                    name="visitors"
                    value={formData.visitors}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select an option</option>
                    <option>Frequently</option>
                    <option>Occasionally</option>
                    <option>Rarely</option>
                    <option>Never</option>
                  </select>
                  <PrioritySelector 
                    category="visitors" 
                    label="Guest policy" 
                    value={formData.priorities.visitors} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* Okay with Visitors? */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">Are you okay with your roomate having guests over? </label>
                  <select
                    name="okvisitors"
                    value={formData.okvisitors}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select an option</option>
                    <option>Yes</option>
                    <option>Occasionally</option>
                    <option>No</option>
                  </select>
                </div>

                {/* Overnight guests */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">Are overnight guests okay? </label>
                  <select
                    name="overnightGuests"
                    value={formData.overnightGuests}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
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
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Study Habits</h2>
                {/* studySpot */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">Where do you prefer to study?</label>
                  <select
                    name="studySpot"
                    value={formData.studySpot}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select an option</option>
                    <option>Home</option>
                    <option>Library</option>
                    <option>Other</option>
                  </select>
                  <PrioritySelector 
                    category="studyHabits" 
                    label="Study habits" 
                    value={formData.priorities.studyHabits} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* Noise Level */}
                <div>
                <label className="block font-medium mb-1 text-indigo-600">Preferred noise level while studying/living?</label>
                <select
                name="noiseLevel"
                value={formData.noiseLevel}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
                >
                <option value="">Select an option</option>
                <option>Silent</option>
                <option>Background noise/music</option>
                <option>No preference</option>
                </select>
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
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Pets</h2>
                {/* pets? */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">Do you have any pets or plan to bring one? </label>
                  <select
                    name="pets"
                    value={formData.pets}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select an option</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                  <PrioritySelector 
                    category="pets" 
                    label="Pet preferences" 
                    value={formData.priorities.pets} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* okPets */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">Are you okay living with animals(cats, dogs, etc.)? </label>
                  <select
                    name="okPets"
                    value={formData.okPets}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
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
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Lifestyle</h2>
                {/* Lifestyle (multiple) */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">Which of these describe your lifestyle? (Select all that apply)</label>
                  <div className="flex flex-wrap gap-4">
                    {[' Smokes ', ' Drinks ', ' Cooks often ', ' Vegetarian ', ' Stays up late ', ' Wakes up early '].map((item) => (
                      <label key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="lifestyle"
                          value={item}
                          checked={formData.lifestyle.includes(item)}
                          onChange={handleChange}
                          className="accent-purple-600"
                        />
                        <span>{item}</span>
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
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Compatability</h2>
                {/* Preffered Geneder Roommate */}
                <div>
                <label className="block font-medium mb-1 text-indigo-600">Preferred gender of roommate? </label>
                <select
                name="prefGender"
                value={formData.prefGender}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
                >
                <option value="">Select an option</option>
                <option>No Preference</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                </select>
                </div>

                {/* Hobbies */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">What are some of your hobbies and interests? </label>
                  <input
                    type="text"
                    name="Hobbies"
                    value={formData.Hobbies.join('\n')}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        Hobbies: e.target.value.split('\n'),
                      }))
                    }
                    className="w-full border rounded p-2"
                    placeholder="I really like to go hiking"
                  />
                </div>

                {/* Dealbreakers or Must Haves */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">What are some dealbreakers or must-haves in a roommate? </label>
                  <input
                    type="text"
                    name="dealMust"
                    value={formData.dealMust.join('\n')}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dealMust: e.target.value.split('\n'),
                      }))
                    }
                    className="w-full border rounded p-2"
                    placeholder="I NEED a roommate who..."
                  />
                </div>

                {/* Sharing (open-ended) */}
                <div>
                  <label className="block font-medium mb-1 text-indigo-600">Tell us a little about yourself! </label>
                  <input
                    type="text"
                    name="sharing"
                    value={formData.sharing.join('\n')}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sharing: e.target.value.split('\n'),
                      }))
                    }
                    className="w-full border rounded p-2"
                    placeholder="Im from LA and..."
                  />
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="step-7" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-purple-600">Review & Submit</h2>
                <p className="text-gray-700 mb-2">Double check your answers before submitting!</p>
                <p className="text-gray-500 text-sm">We'll match you based on your inputs and priorities.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-10">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded disabled:opacity-50"
          >
            Back
          </button>

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded"
            >
              Submit
            </button>
          )}
        </div>
        {submitted && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded text-center shadow-md">
            <h2 className="text-2xl font-bold mb-2">🎉 Thank you!</h2>
            <p>Your questionnaire has been submitted successfully!!</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Questionnaire;