"use client";
import { useState } from "react";

type ShopItem = {
  name: string;
  price: string;
  image: string;
  description: string;
  tag: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
};

type TestimonialItem = {
  name: string;
  message: string;
  image: string;
};

type UpdateItem = {
  title: string;
  description: string;
  date: string;
  image: string;
};

type ProjectFormData = {
  name: string;
  country: string;
  goal: string;
  description: string;
  image: string;
  gallery: string[];
  tabs: {
    shop: boolean;
    quiz: boolean;
    testimonials: boolean;
    updates: boolean;
  };
  shopItems: ShopItem[];
  quizQuestions: QuizQuestion[];
  testimonials: TestimonialItem[];
  updates: UpdateItem[];
};

export default function CreateProjectForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    country: "",
    goal: "",
    description: "",
    image: "",
    gallery: [],
    tabs: {
      shop: true,
      quiz: false,
      testimonials: true,
      updates: true,
    },
    shopItems: [],
    quizQuestions: [],
    testimonials: [],
    updates: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (tab: keyof typeof formData.tabs) => {
    setFormData({
      ...formData,
      tabs: { ...formData.tabs, [tab]: !formData.tabs[tab] },
    });
  };

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 8));
  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Projet "${formData.name}" soumis pour validation ✅`);
    setCurrentStep(1);
  };

  // === SHOP ===
  const addShopItem = () => {
    const newItem = { name: "", price: "", image: "", description: "", tag: "" };
    setFormData({ ...formData, shopItems: [...formData.shopItems, newItem] });
  };

  const updateShopItem = (index: number, field: string, value: string) => {
    const updated = [...formData.shopItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, shopItems: updated });
  };

  // === QUIZ ===
  const addQuizQuestion = () => {
    const newQuestion = { question: "", options: ["", "", "", ""], correct: 0 };
    setFormData({ ...formData, quizQuestions: [...formData.quizQuestions, newQuestion] });
  };

  const updateQuizQuestion = (index: number, field: string, value: string) => {
    const updated = [...formData.quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, quizQuestions: updated });
  };

  // === TESTIMONIAL ===
  const addTestimonial = () => {
    const newItem = { name: "", message: "", image: "" };
    setFormData({ ...formData, testimonials: [...formData.testimonials, newItem] });
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    const updated = [...formData.testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, testimonials: updated });
  };

  // === UPDATE ===
  const addUpdate = () => {
    const newItem = { title: "", description: "", date: "", image: "" };
    setFormData({ ...formData, updates: [...formData.updates, newItem] });
  };

  const updateUpdate = (index: number, field: string, value: string) => {
    const updated = [...formData.updates];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, updates: updated });
  };

  const stepTitles = [
    "Informations générales",
    "Description & image",
    "Structure du projet",
    "Shop",
    "Quiz",
    "Témoignages",
    "Mises à jour",
    "Validation finale",
  ];

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-[#271c70] mb-6 text-center">
        Étape {currentStep} sur 8 — {stepTitles[currentStep - 1]}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* === ÉTAPE 1 === */}
        {currentStep === 1 && (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nom du projet</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#271c70]"
                placeholder="Ex: Puits communautaire à Lusaka"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Pays / région</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#271c70]"
                placeholder="Ex: Zambie"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Objectif ($)</label>
              <input
                type="number"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#271c70]"
                placeholder="15000"
                required
              />
            </div>
          </>
        )}

        {/* === ÉTAPE 2 === */}
        {currentStep === 2 && (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-[#271c70]"
                placeholder="Décrivez les objectifs, les bénéficiaires et les étapes du projet..."
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Image principale (URL)</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#271c70]"
                placeholder="https://exemple.com/photo.jpg"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="mt-4 w-full h-56 object-cover rounded-lg shadow-md"
                />
              )}
            </div>
          </>
        )}

        {/* === ÉTAPE 3 === */}
        {currentStep === 3 && (
          <>
            <h3 className="text-lg font-semibold text-[#271c70] mb-3">
              Sélectionnez les sections à inclure :
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.keys(formData.tabs).map((tab) => (
                <label key={tab} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md">
                  <input
                    type="checkbox"
                    checked={formData.tabs[tab as keyof typeof formData.tabs]}
                    onChange={() => handleTabChange(tab as keyof typeof formData.tabs)}
                  />
                  <span className="capitalize text-gray-700">{tab}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {/* === ÉTAPE 3.1 SHOP === */}
        {currentStep === 4 && formData.tabs.shop && (
          <>
            <h3 className="text-lg font-semibold text-[#271c70] mb-3">🛍️ Besoins du projet</h3>
            {formData.shopItems.map((item, i) => (
              <div key={i} className="p-4 border rounded-lg mb-3 bg-gray-50">
                <label className="block text-gray-700 font-medium mb-1">Tag</label>
                <input
                  type="text"
                  placeholder="Ex: Buy Rice, School Supplies, Community Support"
                  className="w-full border p-2 rounded mb-3"
                  value={item.tag || ""}
                  onChange={(e) => updateShopItem(i, "tag", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Nom de l’article"
                  className="w-full border p-2 rounded mb-2"
                  value={item.name}
                  onChange={(e) => updateShopItem(i, "name", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Prix ($)"
                  className="w-full border p-2 rounded mb-2"
                  value={item.price}
                  onChange={(e) => updateShopItem(i, "price", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  className="w-full border p-2 rounded mb-2"
                  value={item.image}
                  onChange={(e) => updateShopItem(i, "image", e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  className="w-full border p-2 rounded"
                  value={item.description}
                  onChange={(e) => updateShopItem(i, "description", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addShopItem}
              className="bg-[#ff9c4b] text-white px-4 py-2 rounded hover:bg-[#271c70]"
            >
              ➕ Ajouter un besoin
            </button>
          </>
        )}

        {/* === ÉTAPE 3.2 QUIZ === */}
        {currentStep === 5 && formData.tabs.quiz && (
          <>
            <h3 className="text-lg font-semibold text-[#271c70] mb-3">🧠 Questions du quiz</h3>
            {formData.quizQuestions.map((q, i) => (
              <div key={i} className="p-4 border rounded-lg mb-3 bg-gray-50">
                <input
                  type="text"
                  placeholder="Question"
                  className="w-full border p-2 rounded mb-2"
                  value={q.question}
                  onChange={(e) => updateQuizQuestion(i, "question", e.target.value)}
                />
                {q.options.map((opt, j) => (
                  <input
                    key={j}
                    type="text"
                    placeholder={`Réponse ${j + 1}`}
                    className="w-full border p-2 rounded mb-1"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...q.options];
                      updated[j] = e.target.value;
                      const updatedQuestions = [...formData.quizQuestions];
                      updatedQuestions[i].options = updated;
                      setFormData({ ...formData, quizQuestions: updatedQuestions });
                    }}
                  />
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={addQuizQuestion}
              className="bg-[#ff9c4b] text-white px-4 py-2 rounded hover:bg-[#271c70]"
            >
              ➕ Ajouter une question
            </button>
          </>
        )}

        {/* === ÉTAPE 3.3 TESTIMONIAL === */}
        {currentStep === 6 && formData.tabs.testimonials && (
          <>
            <h3 className="text-lg font-semibold text-[#271c70] mb-3">💬 Témoignages</h3>
            {formData.testimonials.map((t, i) => (
              <div key={i} className="p-4 border rounded-lg mb-3 bg-gray-50">
                <input
                  type="text"
                  placeholder="Nom"
                  className="w-full border p-2 rounded mb-2"
                  value={t.name}
                  onChange={(e) => updateTestimonial(i, "name", e.target.value)}
                />
                <textarea
                  placeholder="Message"
                  className="w-full border p-2 rounded"
                  value={t.message}
                  onChange={(e) => updateTestimonial(i, "message", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addTestimonial}
              className="bg-[#ff9c4b] text-white px-4 py-2 rounded hover:bg-[#271c70]"
            >
              ➕ Ajouter un témoignage
            </button>
          </>
        )}

        {/* === ÉTAPE 3.4 UPDATES === */}
        {currentStep === 7 && formData.tabs.updates && (
          <>
            <h3 className="text-lg font-semibold text-[#271c70] mb-3">📰 Mises à jour</h3>
            {formData.updates.map((u, i) => (
              <div key={i} className="p-4 border rounded-lg mb-3 bg-gray-50">
                <input
                  type="text"
                  placeholder="Titre"
                  className="w-full border p-2 rounded mb-2"
                  value={u.title}
                  onChange={(e) => updateUpdate(i, "title", e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  className="w-full border p-2 rounded mb-2"
                  value={u.description}
                  onChange={(e) => updateUpdate(i, "description", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addUpdate}
              className="bg-[#ff9c4b] text-white px-4 py-2 rounded hover:bg-[#271c70]"
            >
              ➕ Ajouter une mise à jour
            </button>
          </>
        )}

        {/* === ÉTAPE 4 VALIDATION === */}
        {currentStep === 8 && (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#271c70] mb-4">
              Vérifiez avant soumission :
            </h3>
            <ul className="text-gray-700 space-y-1 text-left">
              <li>📌 <strong>Nom :</strong> {formData.name}</li>
              <li>🌍 <strong>Pays :</strong> {formData.country}</li>
              <li>💰 <strong>Objectif :</strong> {formData.goal} $</li>
              <li>📝 <strong>Description :</strong> {formData.description}</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              Votre projet sera soumis à l'équipe CFOC pour validation avant publication.
            </p>
          </div>
        )}

        {/* === BOUTONS === */}
        <div className="flex justify-between items-center mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400"
            >
              ⬅️ Précédent
            </button>
          )}
          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto bg-[#ff9c4b] text-white px-6 py-2 rounded-lg hover:bg-[#271c70]"
            >
              Suivant ➡️
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto bg-[#271c70] text-white px-6 py-2 rounded-lg hover:bg-[#ff9c4b]"
            >
              ✅ Soumettre pour validation
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
