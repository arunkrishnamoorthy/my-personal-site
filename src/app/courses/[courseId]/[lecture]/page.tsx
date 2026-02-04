"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import { MainNav } from "@/components/ui/main-nav";
import Link from "next/link";

const videoModules = [
    {
        unit: "Introduction",
        title: "Introduction to forwards market",
        duration: "00:05:26",
        youtubeId: "EmIht4R6xV4",
        takeaways: [
            "The forwards’ contract lays down the essential foundation for a futures contract.",
            "A Forward is an OTC derivative that is not traded on an exchange.",
            "Forward contracts are private agreements whose terms vary from one contract to another.",
        ],
        chapterUrl: "https://zerodha.com/varsity/chapter/forwards-market/",
    },
    {
        unit: "Introduction",
        title: "Introducing the futures contract",
        duration: "00:06:33",
        youtubeId: "EmIht4R6xV4",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Introduction",
        title: "Margins",
        duration: "00:06:29",
        youtubeId: "oeaui4N653c",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Data Binding",
        title: "Leverage and Payoff",
        duration: "00:08:23",
        youtubeId: "EmIht4R6xV4",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Data Binding",
        title: "Futures trade",
        duration: "00:10:09",
        youtubeId: "oeaui4N653c",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Data Binding",
        title: "Settlement",
        duration: "00:03:59",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Models",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Models",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Models",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Models",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Models",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Controllers",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Controllers",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Controllers",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Controllers",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Controllers",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Controllers",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Routing",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Routing",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Routing",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Routing",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    },
    {
        unit: "Routing",
        title: "Open Interest",
        duration: "00:05:25",
        youtubeId: "w4QFvQwQkQw",
        takeaways: [],
        chapterUrl: "",
    }
];

const commentsData = [
    {
        id: 1,
        author: "Rachna",
        date: "April 15, 2025 at 3:41 am",
        content: [
            "We understand NSE has mandated the lot size changes for the index deriv products effective on Dec 24th and 26th depends on the product.",
            "We have found some case whereby the option interest is not an integer of the new lot sizes, examples below –",
            "Nifty 50, Dec 25th, 2025 put options, strike 15000, the OI on Dec, 27th is 1225, which is not an integer of 75 (the new lot size), 1225/75 =16.33<br />Pls could you check internally and/or with NSE how the OI is calculated in this case?",
            "Separately, not related to the lot size change of the late but earlier –",
            "Bank Nifty, Dec 23 put, strike 40500, OI on Jul 7th, 2023 is 6565, again not an integer of the lot size then of 15, 6565/15=437.67<br />Pls could you check internally and/or with NSE how the OI is calculated in this case?"
        ],
        replies: []
    },
    {
        id: 2,
        author: "Nihar Sharma",
        date: "April 21, 2024 at 6:37 pm",
        content: [
            "Sir, for Option Trading (Scalping) OI and Change in OI is helpful for scalper. Can I scalp by observing change in OI and OI this is right way to trade in option trading."
        ],
        replies: [
            {
                id: 3,
                author: "Karthik Rangappa",
                date: "April 22, 2024 at 8:05 am",
                content: [
                    "Could be tricky, I&apos;ve never tried, so cant comment. For scalping, its best to observe the price and place trades I guess. But why scalp, its so much stress <span role=\"img\" aria-label=\"smile\">😊</span>"
                ]
            }
        ]
    },
    {
        id: 4,
        author: "Nihar Sharma",
        date: "April 21, 2024 at 5:29 pm",
        content: [
            "Sir Can you please explain this sentence meaning in brief ‘Abnormally high OI indicates high leverage. Beware of such situations!’."
        ],
        replies: [
            {
                id: 5,
                author: "Karthik Rangappa",
                date: "April 22, 2024 at 8:04 am",
                content: [
                    "It just means that a lots of positions have been built into the system, which indicates the presence of very high leverage. Hence the cautious stance."
                ]
            }
        ]
    }
];

export default function LecturePage() {
    const [selected, setSelected] = useState(0);
    const video = videoModules[selected];

    // Comment state
    const [comments, setComments] = useState(commentsData);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<number>(0); // comment id or reply id
    const [replyText, setReplyText] = useState("");

    // Add new top-level comment
    const handleAddComment = () => {
        if (!newComment.trim()) return;
        setComments([
            ...comments,
            {
                id: Date.now(),
                author: "You",
                date: new Date().toLocaleString(),
                content: [newComment],
                replies: []
            }
        ]);
        setNewComment("");
    };

    // Add reply to a comment
    const handleAddReply = (commentId: number) => {
        if (!replyText.trim()) return;
        setComments(comments.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    replies: [
                        ...comment.replies,
                        {
                            id: Date.now(),
                            author: "You",
                            date: new Date().toLocaleString(),
                            content: [replyText]
                        }
                    ]
                };
            }
            return comment;
        }));
        setReplyingTo(0);
        setReplyText("");
    };

    return (
        <Container>
            <MainNav />

            {/* Background gradient for light mode */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

            <div className="max-w-6xl mx-auto mt-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            Beginners Guide to SAP UI5
                        </h2>
                        <div className="h-1 bg-[#eebbc3] rounded mt-1" />
                    </div>
                    <Link href="/courses" className="text-blue-700 text-sm hover:underline">
                        &larr; Back to Course Page
                    </Link>
                </div>

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Video List */}
                    <aside className="md:w-1/3 w-full">
                        <div className="sticky top-8" style={{ height: "calc(100vh - 4rem)" }}>
                            <div
                                className="bg-gray-100 dark:bg-[#232946] rounded-2xl shadow p-4 h-full overflow-y-auto"
                                style={{ maxHeight: "100%" }}
                            >
                                {videoModules.map((mod, idx) => {
                                    const showDivider =
                                        idx === 0 || mod.unit !== videoModules[idx - 1].unit;
                                    return (
                                        <React.Fragment key={mod.title + idx}>
                                            {showDivider && idx !== 0 && (
                                                <div className="border-t border-gray-300 dark:border-[#393e5c] my-3" />
                                            )}
                                            {showDivider && (
                                                <div className="mb-1 mt-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-[#b8c1ec]">
                                                    {mod.unit}
                                                </div>
                                            )}
                                            <div
                                                className={`py-3 px-2 rounded cursor-pointer transition-colors ${idx === selected
                                                    ? "bg-white dark:bg-[#181c2a] font-semibold text-black-700"
                                                    : "text-gray-800 dark:text-[#b8c1ec] hover:bg-gray-200 dark:hover:bg-[#20233a]"
                                                    }`}
                                                onClick={() => setSelected(idx)}
                                            >
                                                <div className={idx === selected ? "text-black-700" : ""}>
                                                    {idx + 1}. {mod.title}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{mod.duration}</div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Video Player and Details */}
                    <main className="flex-1">
                        <div className="bg-white dark:bg-[#232946] rounded-2xl shadow p-4 mb-6">
                            <div className="aspect-video w-full rounded overflow-hidden mb-4">
                                <iframe
                                    width="100%"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full rounded"
                                ></iframe>
                            </div>
                            {video.chapterUrl && (
                                <div className="mb-4 text-gray-700 dark:text-gray-300 text-sm">
                                    We recommend reading{" "}
                                    <a
                                        href={video.chapterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-700 underline"
                                    >
                                        this chapter
                                    </a>{" "}
                                    on Varsity to learn more and understand the concepts in-depth.
                                </div>
                            )}
                            {video.takeaways.length > 0 && (
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white mb-2">
                                        Key takeaways from this chapter
                                    </div>
                                    <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 text-sm">
                                        {video.takeaways.map((t, i) => (
                                            <li key={i}>{t}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                {/* Comments Section */}
                <div className="max-w-3xl mx-auto mt-10 border-t pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-7 h-7 text-xs font-bold">
                            {comments.length}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">comments</span>
                    </div>
                    {/* New Comment Box */}
                    <div className="mb-8">
                        <textarea
                            className="w-full border border-gray-300 dark:border-[#393e5c] rounded p-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            rows={3}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                        />
                        <button
                            className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded hover:bg-blue-700"
                            onClick={handleAddComment}
                        >
                            Submit
                        </button>
                    </div>
                    {/* Render Comments */}
                    {comments.map(comment => (
                        <div className="mb-8" key={comment.id}>
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {comment.author} <span className="font-normal text-gray-500 text-xs">says:</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">{comment.date}</div>
                            <div className="text-sm text-gray-800 dark:text-gray-200 mb-2 space-y-2">
                                {comment.content.map((line, i) => (
                                    <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
                                ))}
                            </div>
                            {replyingTo === comment.id ? (
                                <div className="mb-2">
                                    <textarea
                                        className="w-full border border-gray-300 dark:border-[#393e5c] rounded p-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        rows={2}
                                        placeholder="Write a reply..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                    />
                                    <button
                                        className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded hover:bg-blue-700 mr-2"
                                        onClick={() => handleAddReply(comment.id)}
                                    >
                                        Reply
                                    </button>
                                    <button
                                        className="text-xs text-gray-500 hover:underline"
                                        onClick={() => { setReplyingTo(0); setReplyText(""); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="text-blue-700 text-xs font-semibold hover:underline"
                                    onClick={() => { setReplyingTo(comment?.id); setReplyText(""); }}
                                >
                                    Reply
                                </button>
                            )}
                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && comment.replies.map(reply => (
                                <div key={reply.id} className="ml-6 mt-4 border-l pl-4 border-gray-200 dark:border-[#393e5c]">
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {reply.author} <span className="font-normal text-gray-500 text-xs">says:</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">{reply.date}</div>
                                    <div className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                                        {reply.content.map((line, i) => (
                                            <span key={i} dangerouslySetInnerHTML={{ __html: line }} />
                                        ))}
                                    </div>
                                    {replyingTo === reply.id ? (
                                        <div className="mb-2">
                                            <textarea
                                                className="w-full border border-gray-300 dark:border-[#393e5c] rounded p-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                rows={2}
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                            />
                                            <button
                                                className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded hover:bg-blue-700 mr-2"
                                                onClick={() => handleAddReply(comment.id)}
                                            >
                                                Reply
                                            </button>
                                            <button
                                                className="text-xs text-gray-500 hover:underline"
                                                onClick={() => { setReplyingTo(0); setReplyText(""); }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="text-blue-700 text-xs font-semibold hover:underline"
                                            onClick={() => { setReplyingTo(reply.id); setReplyText(""); }}
                                        >
                                            Reply
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}