"""Real-browser progression, hint accounting, persistence and profile isolation.
Run with `npm run test:browser` (Python Playwright and Chromium required).
"""
import functools
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

    def test_diagnostic_remediation_and_profile_isolation(self):
        context = self.browser.new_context(viewport={'width':390, 'height':844})
        page = context.new_page()
        errors=[]
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}')
        def click(action):
            page.locator(f'[data-action="{action}"]').first.click()
        def answer(n, d=None):
            page.locator('#numerator').fill(str(n))
            if d is not None: page.locator('#denominator').fill(str(d))
            click('check-answer')
        click('start-fractions')
        # Retry the known denominator-only misconception, then confirm on a new item.
        answer(1,4)
        self.assertIn('same factor',page.locator('[role=status]').inner_text())
        answer(1,4)
        click('next-question')
        answer(1,10);answer(1,10)
        click('next-question')
        # Common denominators and addition are assessed independently.
        answer(6);click('next-question');answer(3,8);click('next-question')
        self.assertIn('Equivalent fractions', page.locator('h1').inner_text())
        click('begin-practice')
        click('hint');answer(3,9);click('next-question')
        answer(3,12);click('next-question')
        answer(3,15);click('next-question')
        answer(2,12);click('next-question')
        self.assertIn('A useful next step',page.locator('h1').inner_text())
        stored=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        progress=stored['progress']['kodjo::maths.fractions.equivalent']
        self.assertTrue(progress['secure'])
        self.assertEqual(progress['hints'],1)
        self.assertEqual(progress['diagnosis']['status'],'likely')
        self.assertEqual(len(stored['sessions']),1)
        click('parent')
        self.assertIn('Recommended next exercise',page.locator('main').inner_text())
        self.assertIn('Common denominators',page.locator('main').inner_text())
        page.select_option('#profile-select','nico')
        click('start-fractions');answer(2,4)
        page.reload()
        saved=page.evaluate("JSON.parse(localStorage.getItem('family-learning-lab:v1'))")
        self.assertEqual(saved['progress']['kodjo::maths.fractions.equivalent'],progress)
        self.assertEqual(saved['progress']['nico::maths.fractions.equivalent']['attempts'],1)
        self.assertFalse(saved['progress']['nico::maths.fractions.equivalent']['secure'])
        self.assertEqual(saved['activeLearnerId'],'nico')
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

if __name__ == '__main__':
    unittest.main()
