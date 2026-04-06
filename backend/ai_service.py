import google.generativeai as genai
import os, json

from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
model_pro = genai.GenerativeModel("gemini-2.0-flash-lite")
model_flash = genai.GenerativeModel("gemini-2.0-flash-lite")

def get_brand_context(brand) -> str:
    if not brand: return ""
    a = brand.target_audience or {}
    return f"""Brand: {brand.name} | Industry: {brand.industry}
Audience: Age {a.get('age','N/A')}, Interests: {', '.join(a.get('interests',[]))}, Pain Points: {', '.join(a.get('pain_points',[]))}
Tone: {', '.join(brand.tone or [])}
Always include: {', '.join(brand.keywords_include or [])}
Never use: {', '.join(brand.keywords_avoid or [])}"""

def safe_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = [l for l in text.split("\n") if not l.strip().startswith("```")]
        text = "\n".join(lines)
    try:
        return json.loads(text)
    except:
        s, e = text.find("{"), text.rfind("}") + 1
        if s != -1 and e > s:
            try: return json.loads(text[s:e])
            except: pass
    return {"error": "Parse failed", "raw": text[:300]}

def validate_campaign(brand, campaign) -> str:
    try:
        r = model_flash.generate_content(f"""You are a senior marketing strategist. Validate this campaign setup.
{get_brand_context(brand)}
Campaign: {campaign.name} | Goal: {campaign.goal} | Platforms: {', '.join(campaign.platforms or [])} | Duration: {campaign.duration}
Give 3-4 bullet points of actionable feedback. Check tone-platform fit (e.g. Playful may underperform on LinkedIn).""")
        return r.text
    except Exception as e:
        return f"AI validation unavailable: {e}"

def generate_all_content(brand, campaign, topic: str, extra: str = "") -> dict:
    ctx = get_brand_context(brand)
    prompt = f"""Expert marketing copywriter. Generate ALL content formats below.
STRICTLY respect brand tone and include required keywords.
{ctx}
Campaign: {campaign.name} | Goal: {campaign.goal}
Topic: {topic}{chr(10)+'Extra: '+extra if extra else ''}

Return ONLY valid JSON, no markdown fences:
{{"linkedin":{{"thought_leadership":"...","story_based":"...","direct_cta":"..."}},"instagram":{{"with_emojis":"...","without_emojis":"...","hashtags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"]}},"twitter":{{"stat":"...","question":"...","hot_take":"...","tip":"...","announcement":"..."}},"video_scripts":{{"30_second":{{"hook":"...","body":"...","cta":"..."}},"60_second":{{"hook":"...","body":"...","cta":"..."}}}},"email":{{"subject_line":"...","body":"...","cta":"..."}},"blog_outline":{{"h1":"...","sections":[{{"h2":"...","key_points":["...","..."],"word_count":250}}]}},"google_ads":[{{"headline":"...","description":"..."}},{{"headline":"...","description":"..."}},{{"headline":"...","description":"..."}}],"seo":{{"meta_title":"...","meta_description":"..."}}}}"""
    try:
        return safe_json(model_pro.generate_content(prompt).text)
    except Exception as e:
        return {"error": str(e)}

def refine_content(original: str, instruction: str, brand=None) -> str:
    ctx = get_brand_context(brand) if brand else ""
    try:
        return model_flash.generate_content(f"""Refine this content per instruction. {ctx}
Original: {original}
Instruction: {instruction}
Return only refined content.""").text.strip()
    except Exception as e:
        return f"Error: {e}"

def repurpose_content(brand, campaign, asset_name: str, asset_type: str, content: str) -> dict:
    ctx = get_brand_context(brand)
    prompt = f"""Content strategist. Repurpose this {asset_type} into marketing formats.
{ctx} Campaign: {campaign.name} | Asset: {asset_name}
Content: {content[:3000]}
Return ONLY valid JSON:
{{"key_insights":["...","...","...","...","..."],"quotable_lines":["...","...","..."],"summary":"...","coverage_map":[{{"section":"Introduction","usage_percentage":40,"used_for":["LinkedIn","Twitter"]}},{{"section":"Main Body","usage_percentage":80,"used_for":["Email","Blog"]}},{{"section":"Conclusion","usage_percentage":60,"used_for":["Google Ads"]}}],"generated_content":{{"linkedin_post":"... (Based on {asset_name})","instagram_caption":"...","twitter_thread":["tweet1","tweet2","tweet3"],"email_section":{{"subject":"...","body":"...","cta":"..."}},"google_ad":{{"headline":"...","description":"..."}}}}}}"""
    try:
        return safe_json(model_pro.generate_content(prompt).text)
    except Exception as e:
        return {"error": str(e)}

def generate_ad_variants(product: str, audience: str, platform: str, goal: str, brand=None) -> dict:
    ctx = get_brand_context(brand) if brand else ""
    prompt = f"""Generate 5 ad copy variants. Product: {product} | Audience: {audience} | Platform: {platform} | Goal: {goal}
{ctx}
Return ONLY valid JSON:
{{"variants":[{{"headline":"...","description":"...","tone_label":"Emotional"}},{{"headline":"...","description":"...","tone_label":"Logical"}},{{"headline":"...","description":"...","tone_label":"Urgency"}},{{"headline":"...","description":"...","tone_label":"Social Proof"}},{{"headline":"...","description":"...","tone_label":"Curiosity"}}],"top_pick_index":0,"top_pick_reason":"..."}}"""
    try:
        return safe_json(model_pro.generate_content(prompt).text)
    except Exception as e:
        return {"error": str(e)}

def analyze_sentiment(data: list, brand=None) -> dict:
    ctx = get_brand_context(brand) if brand else ""
    reviews = "\n".join([f"- {r}" for r in data[:100]])
    prompt = f"""Market research analyst. Analyze customer reviews.
{reviews}
{ctx}
Return ONLY valid JSON:
{{"sentiment_score":{{"positive":65,"neutral":20,"negative":15}},"positive_themes":[{{"theme":"...","count":12,"example":"..."}},{{"theme":"...","count":8,"example":"..."}},{{"theme":"...","count":6,"example":"..."}},{{"theme":"...","count":4,"example":"..."}},{{"theme":"...","count":2,"example":"..."}}],"negative_themes":[{{"theme":"...","count":7,"example":"..."}},{{"theme":"...","count":5,"example":"..."}},{{"theme":"...","count":3,"example":"..."}},{{"theme":"...","count":2,"example":"..."}},{{"theme":"...","count":1,"example":"..."}}],"high_impact_comments":["...","...","..."],"campaign_angles":["...","...","..."],"voice_of_customer_summary":"...","word_frequencies":{{"quality":15,"support":12,"easy":9,"fast":8,"value":6,"helpful":5,"reliable":4,"simple":3}}}}"""
    try:
        return safe_json(model_pro.generate_content(prompt).text)
    except Exception as e:
        return {"error": str(e)}

def suggest_posting_schedule(campaign, contents: list) -> str:
    try:
        return model_flash.generate_content(f"""Social media strategist. Suggest optimal posting schedule.
Campaign Goal: {campaign.goal} | Duration: {campaign.duration} | Platforms: {', '.join(campaign.platforms or [])} | Content pieces: {len(contents)}
Give 4-5 bullet points on best times and frequency per platform.""").text
    except Exception as e:
        return f"Schedule unavailable: {e}"

def analyze_competitor(competitor_post: str, brand=None, campaign=None) -> dict:
    ctx = get_brand_context(brand) if brand else ""
    cinfo = f"Campaign Goal: {campaign.goal}" if campaign else ""
    prompt = f"""Analyze competitor post and suggest counter-strategies.
{ctx} {cinfo}
Competitor Post: {competitor_post}
Return ONLY valid JSON:
{{"tone_analysis":"...","key_messages":["...","...","..."],"weaknesses":["...","..."],"counter_strategy":"...","counter_post_suggestion":"...","tone_consistency_score":72,"tone_consistency_notes":"..."}}"""
    try:
        return safe_json(model_pro.generate_content(prompt).text)
    except Exception as e:
        return {"error": str(e)}
