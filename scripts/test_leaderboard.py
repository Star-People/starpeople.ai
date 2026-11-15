import copy
import importlib.util
import unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location('leaderboard', Path(__file__).with_name('update-leaderboard.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class LeaderboardTests(unittest.TestCase):
    def data(self):
        point = dict(epoch=1, count=100, settings_revisions={lane: 0 for lane in m.NAMES}, lanes={lane: dict(tp=40, fn=10, tn=45, fp=5) for lane in m.NAMES})
        point.update({lane+'_version': 'abc' for lane in m.NAMES})
        return {'model_comparison': {'scope': 'training set', 'points': [point]}}
    def test_ties_and_precision(self):
        result = m.snapshot(self.data())
        self.assertEqual([r['rank'] for r in result['models']], [1,1,1,1])
        self.assertAlmostEqual(result['models'][0]['precision'], 40/45)
    def test_rejects_different_population(self):
        data=self.data();data['model_comparison']['points'][0]['lanes']['machine']['fp']+=1
        with self.assertRaises(ValueError):m.snapshot(data)
    def test_ignores_partial_and_sorts_by_timestamp(self):
        data=self.data();data['model_comparison']['points'].insert(0,dict(epoch=20,lanes={'human':{}}))
        self.assertEqual(len(m.snapshot(data)['models']),4)
    def test_no_predicted_anomalies(self):
        data=self.data();data['model_comparison']['points'][0]['lanes']['machine']=dict(tp=0,fp=0,tn=50,fn=50)
        row=m.snapshot(data)['models'][-1]
        self.assertEqual((row['score'],row['precision'],row['false_positive_rate']),(0,0,0))

if __name__=='__main__':unittest.main()
