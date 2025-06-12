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
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginTop: '8px', marginBottom: '12px' }}>
    <label style={{ minWidth: '250px', marginRight: '15px', fontSize: '14px', color: '#6b7280', textAlign: 'right' }}>{label} priority: </label>
    <div style={{ width: '400px' }}>
      <select
        value={value || ''}
        onChange={(e) => onChange(category, e.target.value as PriorityLevel)}
        style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', fontSize: '14px', border: '1px solid #d1d5db', backgroundColor: 'white', boxSizing: 'border-box' }}
      >
        <option value="">Select priority</option>
        <option value="Not Important">Not Important</option>
        <option value="Somewhat Important">Somewhat Important</option>
        <option value="Very Important">Very Important</option>
        <option value="Deal Breaker">Deal Breaker</option>
      </select>
    </div>
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

// Consistent styles for form elements
const formControlStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: 'white',
  fontSize: '16px',
  boxSizing: 'border-box' as const
};

const labelStyle = {
  width: '250px',
  marginRight: '15px',
  textAlign: 'right' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'flex-start',
  lineHeight: 1.4,
};

const fieldContainerStyle = {
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center'
};

const inputWrapperStyle = {
  width: '400px'
};

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
    // if (formData.sharing.length === 0) missingFields.push('about yourself');
    // if (formData.Hobbies.length === 0) missingFields.push('hobbies');
    // if (formData.dealMust.length === 0) missingFields.push('dealbreakers / must-haves');

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
                <div style={fieldContainerStyle}>
                    <label style={labelStyle}>What is your full name? </label>
                    <div style={inputWrapperStyle}>
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
                        style={formControlStyle}
                        placeholder="Sammy S. Slug"
                      />
                    </div>
                </div>
                {/* Major */}
                <div style={fieldContainerStyle}>
                    <label style={labelStyle}>What are you majoring in? </label>
                    <div style={inputWrapperStyle}>
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
                        style={formControlStyle}
                        placeholder="Computer Science"
                      />
                    </div>
                </div>

                {/* Year in School */}
                <div style={fieldContainerStyle}>
                    <label style={labelStyle}>What year are you? </label>
                    <div style={inputWrapperStyle}>
                      <select
                        required
                        name="yearlvl"
                        value={formData.yearlvl}
                        onChange={handleChange}
                        style={formControlStyle}
                      >
                        <option value="">Select an option</option>
                        <option>First Year</option>
                        <option>Second Year</option>
                        <option>Third Year</option>
                        <option>Fourth Year</option>
                        <option>Grad Student</option>
                      </select>
                    </div>
                </div>

                {/* Gender */}
                <div style={fieldContainerStyle}>
                    <label style={labelStyle}>What gender are you? </label>
                    <div style={inputWrapperStyle}>
                      <select
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                        required
                        style={formControlStyle}
                      >
                        <option value="">Select an option</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step-1" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Living Habits</h2>
                  {/* Sleep Schedule */}
                  <div style={{ marginBottom: '30px' }}>
                    <div style={{ ...fieldContainerStyle, marginBottom: '0' }}>
                      <label style={labelStyle}>When do you usually go to bed? </label>
                      <div style={inputWrapperStyle}>
                        <select
                          name="sleepSchedule"
                          value={formData.sleepSchedule}
                          onChange={handleChange}
                          required
                          style={formControlStyle}
                        >
                          <option value="">Select an option</option>
                          <option>Before 10pm</option>
                          <option>10pm - 12am</option>
                          <option>After 12am</option>
                        </select>
                      </div>
                    </div>
                    <PrioritySelector 
                      category="sleepSchedule" 
                      label="Sleep schedule" 
                      value={formData.priorities.sleepSchedule} 
                      onChange={handlePriorityChange} 
                    />
                  </div>

                  {/* Wake up Schedule */}
                  <div style={{ marginBottom: '30px' }}>
                    <div style={{ ...fieldContainerStyle, marginBottom: '0' }}>
                      <label style={labelStyle}>When do you usually wake up? </label>
                      <div style={inputWrapperStyle}>
                        <select
                          name="wakeupSchedule"
                          value={formData.wakeupSchedule}
                          onChange={handleChange}
                          required
                          style={formControlStyle}
                        >
                          <option value="">Select an option</option>
                          <option>Before 7am</option>
                          <option>7am - 9am</option>
                          <option>After 9am</option>
                        </select>
                      </div>
                    </div>
                    <PrioritySelector 
                      category="wakeupSchedule" 
                      label="Wake-up schedule" 
                      value={formData.priorities.wakeupSchedule} 
                      onChange={handlePriorityChange} 
                    />
                  </div>

                  {/* Cleanliness */}
                  <div style={{ marginBottom: '30px' }}>
                    <div style={{ ...fieldContainerStyle, marginBottom: '0' }}>
                      <label style={labelStyle}>How tidy are you? </label>
                      <div style={inputWrapperStyle}>
                        <select
                          name="cleanliness"
                          value={formData.cleanliness}
                          onChange={handleChange}
                          required
                          style={formControlStyle}
                        >
                          <option value="">Select an option</option>
                          <option>Very tidy</option>
                          <option>Moderately tidy</option>
                          <option>Messy</option>
                        </select>
                      </div>
                    </div>
                    <PrioritySelector 
                      category="cleanliness" 
                      label="Cleanliness" 
                      value={formData.priorities.cleanliness} 
                      onChange={handlePriorityChange} 
                    />
                  </div>
                
                  {/* roommateCleanliness */}
                  <div style={fieldContainerStyle}>
                    <label style={labelStyle}>How important is cleanliness in a roomate? </label>
                    <div style={inputWrapperStyle}>
                      <select
                        name="roommateCleanliness"
                        value={formData.roommateCleanliness}
                        onChange={handleChange}
                        required
                        style={formControlStyle}
                      >
                        <option value="">Select an option</option>
                        <option>Not Important</option>
                        <option>Somewhat Important</option>
                        <option>Very Important</option>
                      </select>
                    </div>
                  </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Guest Preferences</h2>
                {/* Visitors */}
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ ...fieldContainerStyle, marginBottom: '0' }}>
                    <label style={labelStyle}>How often do you have guests over? </label>
                    <div style={inputWrapperStyle}>
                      <select
                        name="visitors"
                        value={formData.visitors}
                        onChange={handleChange}
                        required
                        style={formControlStyle}
                      >
                        <option value="">Select an option</option>
                        <option>Frequently</option>
                        <option>Occasionally</option>
                        <option>Rarely</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
                  <PrioritySelector 
                    category="visitors" 
                    label="Guest policy" 
                    value={formData.priorities.visitors} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* Okay with Visitors? */}
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>Are you okay with your roomate having guests over? </label>
                  <div style={inputWrapperStyle}>
                    <select
                      name="okvisitors"
                      value={formData.okvisitors}
                      onChange={handleChange}
                      required
                      style={formControlStyle}
                    >
                      <option value="">Select an option</option>
                      <option>Yes</option>
                      <option>Occasionally</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>

                {/* Overnight guests */}
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>Are overnight guests okay? </label>
                  <div style={inputWrapperStyle}>
                    <select
                      name="overnightGuests"
                      value={formData.overnightGuests}
                      onChange={handleChange}
                      required
                      style={formControlStyle}
                    >
                      <option value="">Select an option</option>
                      <option>Yes</option>
                      <option>With Notice</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Study Habits</h2>
                {/* studySpot */}
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ ...fieldContainerStyle, marginBottom: '0' }}>
                    <label style={labelStyle}>Where do you prefer to study?</label>
                    <div style={inputWrapperStyle}>
                      <select
                        name="studySpot"
                        value={formData.studySpot}
                        onChange={handleChange}
                        required
                        style={formControlStyle}
                      >
                        <option value="">Select an option</option>
                        <option>Home</option>
                        <option>Library</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <PrioritySelector 
                    category="studyHabits" 
                    label="Study habits" 
                    value={formData.priorities.studyHabits} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* Noise Level */}
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ ...fieldContainerStyle, marginBottom: '0' }}>
                    <label style={labelStyle}>Preferred noise level while studying/living?</label>
                    <div style={inputWrapperStyle}>
                      <select
                        name="noiseLevel"
                        value={formData.noiseLevel}
                        onChange={handleChange}
                        required
                        style={formControlStyle}
                      >
                        <option value="">Select an option</option>
                        <option>Silent</option>
                        <option>Background noise/music</option>
                        <option>No preference</option>
                      </select>
                    </div>
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
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ ...fieldContainerStyle, marginBottom: '0' }}>
                    <label style={labelStyle}>Do you have any pets or plan to bring one? </label>
                    <div style={inputWrapperStyle}>
                      <select
                        name="pets"
                        value={formData.pets}
                        onChange={handleChange}
                        required
                        style={formControlStyle}
                      >
                        <option value="">Select an option</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>
                  <PrioritySelector 
                    category="pets" 
                    label="Pet preferences" 
                    value={formData.priorities.pets} 
                    onChange={handlePriorityChange} 
                  />
                </div>

                {/* okPets */}
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>Are you okay living with animals(cats, dogs, etc.)? </label>
                  <div style={inputWrapperStyle}>
                    <select
                      name="okPets"
                      value={formData.okPets}
                      onChange={handleChange}
                      required
                      style={formControlStyle}
                    >
                      <option value="">Select an option</option>
                      <option>Yes</option>
                      <option>No</option>
                      <option>Other(allergies, certain animals, etc.)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step-5" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Lifestyle</h2>
                {/* Lifestyle (multiple) */}
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <label style={{ ...labelStyle, paddingTop: '8px' }}>Which of these describe your lifestyle the best?</label>
                    <div style={inputWrapperStyle}>
                      <p className="text-sm text-gray-600 mb-3">(Select all that apply)</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[' Smokes ', ' Drinks ', ' Cooks often ', ' Vegetarian ', ' Stays up late ', ' Wakes up early '].map((item) => (
                          <label key={item} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '12px', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            backgroundColor: formData.lifestyle.includes(item) ? '#f3f4f6' : 'white'
                          }}>
                            <div style={{ width: '20px', marginRight: '12px', display: 'flex', justifyContent: 'center' }}>
                              <input
                                type="checkbox"
                                name="lifestyle"
                                value={item}
                                checked={formData.lifestyle.includes(item)}
                                onChange={handleChange}
                                style={{ width: '16px', height: '16px' }}
                              />
                            </div>
                            <span style={{ fontSize: '14px' }}>{item.trim()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
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
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>Preferred gender of roommate? </label>
                  <div style={inputWrapperStyle}>
                    <select
                      name="prefGender"
                      value={formData.prefGender}
                      onChange={handleChange}
                      required
                      style={formControlStyle}
                    >
                      <option value="">Select an option</option>
                      <option>No Preference</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-binary</option>
                    </select>
                  </div>
                </div>

                {/* Max Distance from Campus */}
                <div style={{ ...fieldContainerStyle, marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={labelStyle}>
                      Maximum distance from UCSC campus (in miles)?
                    </label>
                    <div style={inputWrapperStyle}>
                      <input
                        type="text"
                        name="maxDistanceFromCampus"
                        inputMode="decimal"
                        value={formData.maxDistanceFromCampus !== undefined ? formData.maxDistanceFromCampus : ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const numeric = raw === '' ? undefined : Number(raw);
                          setFormData((prev) => ({
                            ...prev,
                            maxDistanceFromCampus: numeric,
                          }));
                        }}
                        style={formControlStyle}
                        placeholder="e.g. 5"
                      />
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        Leave blank if distance doesn't matter
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hobbies */}
                <div style={{ ...fieldContainerStyle, marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <label style={{ ...labelStyle, paddingTop: '8px' }}>What are some of your hobbies and interests? </label>
                    <div style={inputWrapperStyle}>
                      <textarea
                        name="Hobbies"
                        value={formData.Hobbies.join('\n')}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            Hobbies: e.target.value.split('\n'),
                          }))
                        }
                        style={formControlStyle}
                        placeholder="I really like to go hiking"
                        rows={3}
                      />
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                        Optional - for profile display only, not used in matching
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dealbreakers or Must Haves */}
                <div style={{ ...fieldContainerStyle, marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <label style={{ ...labelStyle, paddingTop: '8px' }}>What are some dealbreakers or must-haves in a roommate? </label>
                    <div style={inputWrapperStyle}>
                      <textarea
                        name="dealMust"
                        value={formData.dealMust.join('\n')}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dealMust: e.target.value.split('\n'),
                          }))
                        }
                        style={formControlStyle}
                        placeholder="I NEED a roommate who..."
                        rows={3}
                      />
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                        Optional - for profile display only, not used in matching
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sharing (open-ended) */}
                <div style={{ ...fieldContainerStyle, marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <label style={{ ...labelStyle, paddingTop: '8px' }}>Tell us a little about yourself! </label>
                    <div style={inputWrapperStyle}>
                      <textarea
                        name="sharing"
                        value={formData.sharing.join('\n')}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sharing: e.target.value.split('\n'),
                          }))
                        }
                        style={formControlStyle}
                        placeholder="Im from LA and..."
                        rows={4}
                      />
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                        Optional - for profile display only, not used in matching
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="step-7" {...variants} transition={{ duration: 0.4 }} className="absolute w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Review & Submit</h2>
                <div className="text-center">
                  <div className="mb-8">
                    <svg
                      style={{ width: '48px', height: '48px', color: '#be1818', marginTop: '30px'}}
                      className="mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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

        {/* Progress Bar */}
        <div style={{ maxWidth: '800px', margin: '30px auto 20px', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Step {step + 1} of {steps.length}
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {Math.round(((step + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((step + 1) / steps.length) * 100}%`,
              height: '100%',
              backgroundColor: '#be1818',
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
              {steps[step]}
            </span>
          </div>
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