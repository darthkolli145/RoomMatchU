import React, { useState } from 'react';
import { UserQuestionnaire } from '../types'; // Adjust path if needed

const initialForm: UserQuestionnaire = {
  lifestyle: [],
  cleanliness: '',
  noiseLevel: '',
  sleepSchedule: '',
  visitors: '',
  sharing: [],
  Hobbies: [],
  fullname: [],
  email: [],
  Major: [],
  yearlvl:'',
  Gender: '',
  wakeupSchedule: '',
  roommateCleanliness: '',
  okvisitors: '',
  overnightGuests:'',
  studySpot: '',
  pets: '',
  okPets: '',
  prefGender: '',
  dealMust: [],
};

const Questionnaire: React.FC = () => {
  const [formData, setFormData] = useState<UserQuestionnaire>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Roommate Questionnaire</h1>

      {submitted && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-center">
          ✅ Your answers have been saved!
        </div>
      )}

    <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
    Display Info
    </h2>
    {/*Full Name */}
    <div>
        <label className="block font-medium mb-1 text-indigo-600">What is your full name: </label>
        <textarea
        name="fullname"
        value={formData.fullname.join('\n')}
        onChange={(e) =>
            setFormData((prev) => ({
            ...prev,
            fullname: e.target.value.split('\n'),
            }))
        }
        rows={1}
        className="w-full border rounded p-2"
        placeholder="Sammy S. Slug"
        />
    </div>

    {/* email */}
    <div>
        <label className="block font-medium mb-1 text-indigo-600">What is your UCSC email?: </label>
        <textarea
        name="email"
        value={formData.email.join('\n')}
        onChange={(e) =>
            setFormData((prev) => ({
            ...prev,
            email: e.target.value.split('\n'),
            }))
        }
        rows={1}
        className="w-full border rounded p-2"
        placeholder="samsslug@ucsc.edu"
        />
    </div>

    {/* Major */}
    <div>
        <label className="block font-medium mb-1 text-indigo-600">What are you majoring in: </label>
        <textarea
        name="Major"
        value={formData.Major.join('\n')}
        onChange={(e) =>
            setFormData((prev) => ({
            ...prev,
            Major: e.target.value.split('\n'),
            }))
        }
        rows={1}
        className="w-full border rounded p-2"
        placeholder="Computer Science"
        />
    </div>

    {/* Year in School */}
    <div>
        <label className="block font-medium mb-1 text-indigo-600">What year are you? </label>
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
        <option>Thrid Year</option>
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

    <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
    Living Habits
    </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sleep Schedule */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">When do you usually go to bed?</label>
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
        </div>

        {/* Wake up Schedule */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">When do you usually wake up?</label>
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
        </div>

        {/* Cleanliness */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">How tidy are you?</label>
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
        </div>
       
        {/* roommateCleanliness */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">How important is cleanliness in a roomate?</label>
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
    
        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
        Guest Preferences
        </h2>
        {/* Visitors */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">How often do you have guests over?</label>
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
        </div>

        {/* Okay with Visitors? */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">Are you okay with your roomate having guests over?</label>
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
          <label className="block font-medium mb-1 text-indigo-600">Are overnight guests okay?</label>
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

        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
        Study Habits
        </h2>
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
        </div>

        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
        Pets & Animals
        </h2>

        {/* pets? */}
        <div>
        <label className="block font-medium mb-1 text-indigo-600">Do you have any pets or plan to bring one?</label>
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
        </div>

        {/* okPets */}
        <div>
        <label className="block font-medium mb-1 text-indigo-600">Are you okay living with animals(cats, dogs, etc.)?</label>
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

        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
        Lifestyle
        </h2>
        {/* Lifestyle (multiple) */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">Which of these describe your lifestyle? (Select all that apply)</label>
          <div className="flex flex-wrap gap-4">
            {['Smokes', 'Drinks', 'Cooks often', 'Vegetarian', 'Stays up late', 'Wakes up early'].map((item) => (
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
        </div>

        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
        Compatability Factors
        </h2>
        {/* Preffered Geneder Roommate */}
        <div>
        <label className="block font-medium mb-1 text-indigo-600">Preferred gender of roommate?</label>
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
          <label className="block font-medium mb-1 text-indigo-600">What are some of your hobbies and interests:</label>
          <textarea
            name="Hobbies"
            value={formData.Hobbies.join('\n')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                Hobbies: e.target.value.split('\n'),
              }))
            }
            rows={1}
            className="w-full border rounded p-2"
            placeholder="I really like to go hiking"
          />
        </div>

        {/* Dealbreakers or Must Haves */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">What are some dealbreakers or must-haves in a roommate?:</label>
          <textarea
            name="dealMust"
            value={formData.dealMust.join('\n')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                dealMust: e.target.value.split('\n'),
              }))
            }
            rows={1}
            className="w-full border rounded p-2"
            placeholder="I NEED a roommate who..."
          />
        </div>

        {/* Sharing (open-ended) */}
        <div>
          <label className="block font-medium mb-1 text-indigo-600">Tell us a little about yourself!:</label>
          <textarea
            name="sharing"
            value={formData.sharing.join('\n')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sharing: e.target.value.split('\n'),
              }))
            }
            rows={1}
            className="w-full border rounded p-2"
            placeholder="Im from LA and..."
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700 transition-all"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;

