"""Real-browser progression, hint accounting, persistence and profile isolation.
Run with `npm run test:browser` (Python Playwright and Chromium required).
"""
import functools
import re
import math
from fractions import Fraction
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class BrowserFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'], timeout=20000)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def answer_current(self,page,denominator_only=False):
        prompt=page.locator('h1').inner_text()
        values=[int(v) for v in re.findall(r'\d+',prompt)]
        if prompt.startswith('Write'):
            n,d,target=values
            top=n if denominator_only else n*(target//d)
            page.locator('#numerator').fill(str(top))
            page.locator('#denominator').fill(str(target))
        elif prompt.startswith('Give'):
            _,a,_,b=values
            page.locator('#numerator').fill(str(math.lcm(a,b)))
        else:
            n,a,m,b=values
            result=Fraction(n,a)+Fraction(m,b)
            page.locator('#numerator').fill(str(result.numerator))
            page.locator('#denominator').fill(str(result.denominator))
        page.locator('[data-action="check-answer"]').click()

    def test_diagnostic_remediation_and_profile_isolation(self):
        context = self.browser.new_context(viewport={'width':390, 'height':844})
        page = context.new_page()
        errors=[]
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        def click(action):
            page.locator(f'[data-action="{action}"]').first.click()
        def answer(wrong=False):
            self.answer_current(page,wrong)
        click('start-fractions')
        answer(wrong=True)
        self.assertIn('same factor',page.locator('[role=status]').inner_text())
        answer(wrong=True)
        click('next-question')
        answer(wrong=True);answer(wrong=True)
        click('next-question')
        answer();click('next-question');answer();click('next-question')
        self.assertIn('Equivalent fractions', page.locator('h1').inner_text())
        click('begin-practice')
        click('hint');answer();click('next-question')
        answer();click('next-question')
        answer();click('next-question')
        answer();click('next-question')
        self.assertIn('A useful next step',page.locator('h1').inner_text())
        stored=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        progress=stored['progress']['kodjo::maths.fractions.equivalent']
        self.assertTrue(progress['secure'])
        self.assertEqual(progress['hints'],1)
        self.assertEqual(progress['diagnosis']['status'],'likely')
        self.assertEqual(len(stored['sessions']),1)
        self.assertEqual(stored['version'],2)
        self.assertGreater(stored['rewards']['kodjo']['xp'],0)
        self.assertIn('first-step',stored['rewards']['kodjo']['badges'])
        self.assertIn('first-lesson',stored['rewards']['kodjo']['badges'])
        self.assertEqual(stored['rewards']['kodjo']['completedLessons'],1)
        self.assertEqual(sum(o['xp'] for o in stored['sessions'][0]['outcomes']),stored['sessions'][0]['xp'])
        kodjo_rewards=stored['rewards']['kodjo']
        click('parent')
        self.assertIn('Recommended next exercise',page.locator('main').inner_text())
        self.assertIn('Common denominators',page.locator('main').inner_text())
        page.select_option('#profile-select','nico')
        click('start-fractions');answer()
        page.reload()
        saved=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        self.assertEqual(saved['progress']['kodjo::maths.fractions.equivalent'],progress)
        self.assertEqual(saved['progress']['nico::maths.fractions.equivalent']['attempts'],1)
        self.assertFalse(saved['progress']['nico::maths.fractions.equivalent']['secure'])
        self.assertEqual(saved['activeLearnerId'],'nico')
        self.assertEqual(saved['rewards']['kodjo'],kodjo_rewards)
        self.assertEqual(saved['rewards']['nico']['xp'],12)
        self.assertEqual(errors,[])
        self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'),390)
        context.close()

    def test_due_review_reopens_a_prerequisite(self):
        context=self.browser.new_context()
        page=context.new_page()
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        page.evaluate("""() => {
          const data={version:1,activeLearnerId:'kodjo',profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'}],progress:{},sessions:[]};
          for(const skill of ['equivalent','common-denominator','add-unlike'])
            data.progress['kodjo::maths.fractions.'+skill]={secure:true,checkStreak:2,attempts:1,reviewAt:'2020-01-01T00:00:00Z'};
          localStorage.setItem('family-learning-lab:v1',JSON.stringify(data));
        }""")
        page.reload()
        page.locator('[data-action="start-fractions"]').click()
        self.assertIn('RETENTION CHECK',page.locator('.eyebrow').last.inner_text())
        for _ in range(2):
            page.locator('#numerator').fill('99')
            page.locator('#denominator').fill('97')
            page.locator('[data-action="check-answer"]').click()
        saved=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        self.assertFalse(saved['progress']['kodjo::maths.fractions.equivalent']['secure'])
        self.assertIsNone(saved['progress']['kodjo::maths.fractions.equivalent']['reviewAt'])
        page.locator('[data-action="parent"]').click()
        self.assertIn('Equivalent fractions. Build this prerequisite',page.locator('main').inner_text())
        context.close()

    def test_difficulty_progression_and_age_ceilings(self):
        context=self.browser.new_context()
        page=context.new_page()
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        page.evaluate("""() => {
          const data={version:1,activeLearnerId:'kodjo',profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'},{id:'nico',name:'Nico',year:'Year 9'}],progress:{'kodjo::maths.fractions.equivalent':{mastery:34,attempts:100000}},sessions:[]};
          localStorage.setItem('family-learning-lab:v1',JSON.stringify(data));
        }""")
        page.reload();page.locator('[data-action="start-fractions"]').click()
        self.assertIn('CHALLENGE 1',page.locator('.eyebrow').last.inner_text())
        self.answer_current(page)
        page.locator('[data-action="home"]').first.click()
        page.locator('[data-action="start-fractions"]').click()
        self.assertIn('CHALLENGE 2',page.locator('.eyebrow').last.inner_text())
        page.evaluate("""() => {
          const data=JSON.parse(localStorage.getItem('family-learning-lab:v1'));
          data.progress['kodjo::maths.fractions.equivalent'].mastery=90;
          data.progress['nico::maths.fractions.equivalent']={mastery:90,attempts:1};
          localStorage.setItem('family-learning-lab:v1',JSON.stringify(data));
        }""")
        page.reload();page.locator('[data-action="start-fractions"]').click()
        self.assertIn('CHALLENGE 3',page.locator('.eyebrow').last.inner_text())
        page.select_option('#profile-select','nico');page.locator('[data-action="start-fractions"]').click()
        self.assertIn('CHALLENGE 4',page.locator('.eyebrow').last.inner_text())
        self.answer_current(page)
        self.assertIn('+16 XP',page.locator('.earned-note').inner_text())
        context.close()

    def test_repeat_limits_persist_through_reload_without_attempt_escalation(self):
        context=self.browser.new_context()
        page=context.new_page()
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        recent=[]
        for _ in range(14):
            page.locator('[data-action="start-fractions"]').click()
            self.assertIn('CHALLENGE 1',page.locator('.eyebrow').last.inner_text())
            for _ in range(2):
                page.locator('#numerator').fill('99');page.locator('#denominator').fill('97')
                page.locator('[data-action="check-answer"]').click()
            stored=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
            ids=stored['progress']['kodjo::maths.fractions.equivalent']['recentQuestionIds']
            self.assertNotIn(ids[-1],recent[-12:])
            recent.append(ids[-1])
            self.assertLessEqual(len(ids),12)
            page.reload()
        context.close()

    def test_rewards_are_once_daily_and_support_has_separate_points(self):
        context=self.browser.new_context()
        page=context.new_page()
        page.add_init_script('Math.random=()=>0')
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        page.evaluate("""() => {
          const date=new Date(),day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
          const data={version:2,activeLearnerId:'kodjo',profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'},{id:'nico',name:'Nico',year:'Year 9'}],progress:{},sessions:[],rewards:{kodjo:{xp:12,credited:{[day+':maths.fractions.equivalent:equivalent:1:2:4']:12},badges:['first-step'],independentAnswers:1}}};
          localStorage.setItem('family-learning-lab:v1',JSON.stringify(data));
        }""")
        page.reload();page.locator('[data-action="start-fractions"]').click()
        page.locator('[data-action="check-answer"]').click()  # Empty input earns nothing.
        self.assertIn('12 XP',page.locator('.xp-chip').inner_text())
        self.answer_current(page)
        self.assertIn('+0 XP',page.locator('.earned-note').inner_text())
        page.locator('[data-action="next-question"]').click()
        page.locator('[data-action="hint"]').click();self.answer_current(page)
        self.assertIn('+6 XP',page.locator('.earned-note').inner_text())
        page.reload()
        stored=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        self.assertEqual(stored['rewards']['kodjo']['xp'],18)
        self.assertEqual(stored['rewards']['kodjo']['independentAnswers'],1)
        self.assertEqual(stored['rewards']['kodjo']['supportedAnswers'],1)
        self.assertEqual(stored['rewards']['kodjo']['completedLessons'],0)
        page.select_option('#profile-select','nico');page.locator('[data-action="start-fractions"]').click()
        self.answer_current(page)
        self.assertIn('+12 XP',page.locator('.earned-note').inner_text())
        page.reload();stored=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        self.assertEqual(stored['rewards']['kodjo']['xp'],18)
        self.assertEqual(stored['rewards']['nico']['xp'],12)
        context.close()

    def test_daily_cap_and_level_survive_reload_without_blocking_practice(self):
        context=self.browser.new_context()
        page=context.new_page()
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        page.evaluate("""() => {
          const date=new Date(),day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
          const data={version:2,activeLearnerId:'kodjo',profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'}],progress:{},sessions:[],rewards:{kodjo:{xp:94,credited:{[day+':old:question']:94},badges:[]}}};
          localStorage.setItem('family-learning-lab:v1',JSON.stringify(data));
        }""")
        page.reload();page.locator('[data-action="start-fractions"]').click();self.answer_current(page)
        self.assertIn('+6 XP',page.locator('.earned-note').inner_text())
        page.reload()
        self.assertIn('Level 2',page.locator('.xp-progress-label').inner_text())
        page.locator('[data-action="start-fractions"]').click();self.answer_current(page)
        self.assertIn('+0 XP',page.locator('.earned-note').inner_text())
        self.assertIn('Daily points limit',page.locator('.earned-note').inner_text())
        stored=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        self.assertEqual(stored['rewards']['kodjo']['xp'],100)
        self.assertEqual(stored['progress']['kodjo::maths.fractions.equivalent']['attempts'],2)
        context.close()

    def test_starter_question_credit_is_preserved_after_id_migration(self):
        context=self.browser.new_context()
        page=context.new_page();page.add_init_script('Math.random=()=>0')
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        page.evaluate("""() => {
          const date=new Date(),day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
          const data={version:2,activeLearnerId:'kodjo',profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'}],progress:{},sessions:[],rewards:{kodjo:{xp:12,credited:{[day+':maths.fractions.add-unlike:f01']:12},badges:['first-step']}}};
          localStorage.setItem('family-learning-lab:v1',JSON.stringify(data));
        }""")
        page.reload();page.locator('[data-action="start-fractions"]').click()
        for _ in range(2):
            self.answer_current(page);page.locator('[data-action="next-question"]').click()
        self.assertEqual(page.locator('h1').inner_text(),'What is 1/2 + 1/4?')
        self.answer_current(page)
        self.assertIn('+0 XP',page.locator('.earned-note').inner_text())
        stored=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        self.assertEqual(stored['rewards']['kodjo']['xp'],36)
        self.assertEqual(stored['progress']['kodjo::maths.fractions.add-unlike']['attempts'],1)
        context.close()

if __name__ == '__main__':
    unittest.main()
