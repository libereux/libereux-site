"use client";

import Link from "next/link";
import { useState } from "react";

const businesses = [
  { id: "restaurant", label: "Restaurant or café", who: "diners" },
  { id: "salon", label: "Salon, spa or barber", who: "clients" },
  { id: "hospitality", label: "Guesthouse or rental", who: "guests" },
  { id: "realestate", label: "Real estate", who: "buyers and sellers" },
  { id: "trades", label: "Contractor or trades", who: "homeowners" },
  { id: "retail", label: "Retail shop", who: "shoppers" },
  { id: "services", label: "Professional services", who: "clients" },
];

type Idea = { title: string; body: string; impact: "High" | "Medium"; effort: "Low" | "Medium" };

const drains: { id: string; label: string; ideas: (who: string) => Idea[] }[] = [
  {
    id: "questions",
    label: "Answering the same questions",
    ideas: (who) => [
      { title: "An assistant that answers day and night", body: `It handles the questions ${who} ask most, on your website and the messaging apps they already use, in their language.`, impact: "High", effort: "Low" },
      { title: "One shared answer library", body: "Your team and your assistant work from the same up-to-date answers, so nobody gives out old prices or hours.", impact: "Medium", effort: "Low" },
      { title: "A weekly question report", body: `See what ${who} keep asking, so you can fix the cause on your site or menu instead of answering it forever.`, impact: "Medium", effort: "Low" },
    ],
  },
  {
    id: "booking",
    label: "Booking and scheduling",
    ideas: (who) => [
      { title: "Online booking that fills itself", body: `${cap(who)} pick a time in a few taps, and it lands straight in your calendar.`, impact: "High", effort: "Low" },
      { title: "Reminders that cut no-shows", body: "Automatic confirmations and reminders, with one-tap rescheduling instead of a missed appointment.", impact: "High", effort: "Low" },
      { title: "An assistant that fills cancellations", body: "When a slot opens, the people who asked for that time hear about it first.", impact: "Medium", effort: "Medium" },
    ],
  },
  {
    id: "followups",
    label: "Follow-ups that slip",
    ideas: (who) => [
      { title: "No enquiry goes cold", body: `Every new enquiry gets a prompt reply and a follow-up, even when you are busy with other ${who}.`, impact: "High", effort: "Low" },
      { title: "Review requests at the right moment", body: "A friendly message asks for a review just after a good experience, when people are most likely to leave one.", impact: "Medium", effort: "Low" },
      { title: "A Monday summary of open items", body: "One short message listing who is waiting on what, so nothing depends on memory.", impact: "Medium", effort: "Low" },
    ],
  },
  {
    id: "paperwork",
    label: "Paperwork, quotes and admin",
    ideas: () => [
      { title: "Quotes from a voice note or photo", body: "Describe the job out loud or snap a picture, and a draft quote is ready for you to check and send.", impact: "High", effort: "Medium" },
      { title: "Forms that fill your system", body: "Intake details go straight where they belong, with no copying between spreadsheets and email.", impact: "High", effort: "Low" },
      { title: "Meeting notes that write themselves", body: "Calls turn into a summary and an action list automatically, stored where your team can find them.", impact: "Medium", effort: "Low" },
    ],
  },
  {
    id: "found",
    label: "Getting found online",
    ideas: (who) => [
      { title: "Search clean-up", body: `Clear page titles, descriptions and local listings, so ${who} searching nearby actually see you.`, impact: "High", effort: "Low" },
      { title: "A fast site with one clear button", body: "A modern mobile site where calling, booking or ordering is one tap away.", impact: "High", effort: "Medium" },
      { title: "Posts drafted in your voice", body: "An assistant drafts updates and offers for you to approve, so your pages never go quiet.", impact: "Medium", effort: "Low" },
    ],
  },
];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function OpportunityFinder() {
  const [biz, setBiz] = useState(businesses[0].id);
  const [drain, setDrain] = useState(drains[0].id);
  const b = businesses.find((x) => x.id === biz)!;
  const d = drains.find((x) => x.id === drain)!;
  const ideas = d.ideas(b.who);

  return (
    <div className="finder">
      <div className="finder-controls">
        <fieldset>
          <legend>Your business</legend>
          <div className="chips">
            {businesses.map((x) => (
              <button
                key={x.id}
                type="button"
                className="chip"
                aria-pressed={x.id === biz}
                onClick={() => setBiz(x.id)}
              >
                {x.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>What eats most of your time?</legend>
          <div className="chips">
            {drains.map((x) => (
              <button
                key={x.id}
                type="button"
                className="chip"
                aria-pressed={x.id === drain}
                onClick={() => setDrain(x.id)}
              >
                {x.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="finder-result" aria-live="polite">
        <p className="finder-head">
          Where AI could help a {b.label.toLowerCase()} with {d.label.toLowerCase()}:
        </p>
        <ol className="ideas" key={`${biz}-${drain}`}>
          {ideas.map((i) => (
            <li key={i.title} className="idea">
              <div>
                <h3>{i.title}</h3>
                <p className="muted">{i.body}</p>
              </div>
              <div className="idea-tags">
                <span className={`tag tag-${i.impact.toLowerCase()}`}>Impact: {i.impact}</span>
                <span className="tag">Effort: {i.effort}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="finder-foot">
          These are starting points. Your free consultation turns them into a plan for your business.{" "}
          <Link href="/contact?service=ai-strategy">Get your AI roadmap</Link>
        </p>
      </div>
    </div>
  );
}
