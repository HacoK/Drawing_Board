/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be
 * used to cite it, is:
 *
 *  Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without
 *	   libraries, toolkits or training: A $1 recognizer for user interface
 *	   prototypes. Proceedings of the ACM Symposium on User Interface
 *	   Software and Technology (UIST '07). Newport, Rhode Island (October
 *	   7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed
 * here by Jacob O. Wobbrock:
 *
 *  Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved. Last updated July 14, 2018.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Shape class
//
function Shape(type, path, lineCap, strokeStyle, lineWidth) // constructor
{
    this.Type = type;
    this.Path = path;
    this.LineCap = lineCap;
    this.StrokeStyle = strokeStyle;
    this.LineWidth = lineWidth;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}
//
// DollarRecognizer constants
//
const NumUnistrokes = 6;
const NumPoints = 64;
const SquareSize = 250.0;
const Origin = new Point(0,0);
const Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
const HalfDiagonal = 0.5 * Diagonal;
const AngleRange = Deg2Rad(45.0);
const AnglePrecision = Deg2Rad(2.0);
const Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// one built-in unistroke per gesture type
	//
	this.Unistrokes = new Array(NumUnistrokes);
	this.Unistrokes[0] = new Unistroke("triangle", new Array(new Point(137,139),new Point(135,141),new Point(133,144),new Point(132,146),new Point(130,149),new Point(128,151),new Point(126,155),new Point(123,160),new Point(120,166),new Point(116,171),new Point(112,177),new Point(107,183),new Point(102,188),new Point(100,191),new Point(95,195),new Point(90,199),new Point(86,203),new Point(82,206),new Point(80,209),new Point(75,213),new Point(73,213),new Point(70,216),new Point(67,219),new Point(64,221),new Point(61,223),new Point(60,225),new Point(62,226),new Point(65,225),new Point(67,226),new Point(74,226),new Point(77,227),new Point(85,229),new Point(91,230),new Point(99,231),new Point(108,232),new Point(116,233),new Point(125,233),new Point(134,234),new Point(145,233),new Point(153,232),new Point(160,233),new Point(170,234),new Point(177,235),new Point(179,236),new Point(186,237),new Point(193,238),new Point(198,239),new Point(200,237),new Point(202,239),new Point(204,238),new Point(206,234),new Point(205,230),new Point(202,222),new Point(197,216),new Point(192,207),new Point(186,198),new Point(179,189),new Point(174,183),new Point(170,178),new Point(164,171),new Point(161,168),new Point(154,160),new Point(148,155),new Point(143,150),new Point(138,148),new Point(136,148)));
	this.Unistrokes[1] = new Unistroke("square", new Array(new Point(47, 333),new Point(47, 334.6397958061804),new Point(47, 336),new Point(47, 336.27959161236083),new Point(47, 337.91938741854125),new Point(47, 339.55918322472166),new Point(47, 340),new Point(47, 341.1989790309021),new Point(47, 342.8387748370825),new Point(47, 344),new Point(47, 344.4785706432629),new Point(47, 346.11836644944333),new Point(47, 347.75816225562374),new Point(47, 349),new Point(47, 349.39795806180416),new Point(47, 351.0377538679846),new Point(47, 352.677549674165),new Point(47, 353),new Point(47, 354.3173454803454),new Point(47, 355.9571412865258),new Point(47, 357),new Point(47, 357.59693709270624),new Point(47, 359.23673289888666),new Point(47, 360),new Point(47.87652870506706, 360),new Point(49.51632451124746, 360),new Point(51, 360),new Point(51.15612031742786, 360),new Point(52.795916123608265, 360),new Point(54.43571192978867, 360),new Point(55, 360),new Point(56.07550773596907, 360),new Point(57.71530354214947, 360),new Point(59.35509934832987, 360),new Point(60.994895154510274, 360),new Point(62, 360),new Point(62.634690960690676, 360),new Point(64.27448676687108, 360),new Point(65, 360),new Point(65.91428257305148, 360),new Point(67.55407837923188, 360),new Point(68, 360),new Point(69.19387418541228, 360),new Point(70, 360),new Point(70.83366999159269, 360),new Point(72, 360),new Point(72.06695817525305, 359.53129277322864),new Point(72.29886032211533, 357.9079777451926),new Point(72.53076246897761, 356.2846627171566),new Point(72.76266461583991, 354.6613476891206),new Point(72.9945667627022, 353.03803266108457),new Point(73, 353) ,new Point(73, 351.39862298319025) ,new Point(73, 349.75882717700983) ,new Point(73, 348.1190313708294) ,new Point(73, 347) ,new Point(73, 346.479235564649) ,new Point(73, 345) ,new Point(73, 344.8394397584686) ,new Point(73, 343.19964395228817) ,new Point(73, 342) ,new Point(73, 341.55984814610775) ,new Point(73, 340) ,new Point(73, 339.92005233992734) ,new Point(73, 338.2802565337469) ,new Point(73, 337) ,new Point(73, 336.6404607275665) ,new Point(73, 335.0006649213861) ,new Point(73, 335) ,new Point(72.26695838351611, 333.5339167670322) ,new Point(72, 333) ,new Point(70.95714128652509, 333) ,new Point(69.31734548034468, 333) ,new Point(69, 333) ,new Point(67.67754967416428, 333) ,new Point(67, 333) ,new Point(66.03775386798388, 333) ,new Point(64.39795806180348, 333) ,new Point(64, 333) ,new Point(62.75816225562308, 333) ,new Point(61.118366449442675, 333) ,new Point(61, 333) ,new Point(59.47857064326227, 333) ,new Point(58, 333) ,new Point(57.83877483708187, 333) ,new Point(56.19897903090147, 333) ,new Point(54.55918322472107, 333) ,new Point(53, 333) ,new Point(52.919387418540666, 333) ,new Point(51.279591612360264, 333) ,new Point(50, 333) ,new Point(49.63979580617986, 333) ,new Point(48, 333)));
	this.Unistrokes[2] = new Unistroke("rectangle", new Array(new Point(78,149),new Point(78,153),new Point(78,157),new Point(78,160),new Point(79,162),new Point(79,164),new Point(79,167),new Point(79,169),new Point(79,173),new Point(79,178),new Point(79,183),new Point(80,189),new Point(80,193),new Point(80,198),new Point(80,202),new Point(81,208),new Point(81,210),new Point(81,216),new Point(82,222),new Point(82,224),new Point(82,227),new Point(83,229),new Point(83,231),new Point(85,230),new Point(88,232),new Point(90,233),new Point(92,232),new Point(94,233),new Point(99,232),new Point(102,233),new Point(106,233),new Point(109,234),new Point(117,235),new Point(123,236),new Point(126,236),new Point(135,237),new Point(142,238),new Point(145,238),new Point(152,238),new Point(154,239),new Point(165,238),new Point(174,237),new Point(179,236),new Point(186,235),new Point(191,235),new Point(195,233),new Point(197,233),new Point(200,233),new Point(201,235),new Point(201,233),new Point(199,231),new Point(198,226),new Point(198,220),new Point(196,207),new Point(195,195),new Point(195,181),new Point(195,173),new Point(195,163),new Point(194,155),new Point(192,145),new Point(192,143),new Point(192,138),new Point(191,135),new Point(191,133),new Point(191,130),new Point(190,128),new Point(188,129),new Point(186,129),new Point(181,132),new Point(173,131),new Point(162,131),new Point(151,132),new Point(149,132),new Point(138,132),new Point(136,132),new Point(122,131),new Point(120,131),new Point(109,130),new Point(107,130),new Point(90,132),new Point(81,133),new Point(76,133)));
	this.Unistrokes[3] = new Unistroke("circle", new Array(new Point(127,141),new Point(124,140),new Point(120,139),new Point(118,139),new Point(116,139),new Point(111,140),new Point(109,141),new Point(104,144),new Point(100,147),new Point(96,152),new Point(93,157),new Point(90,163),new Point(87,169),new Point(85,175),new Point(83,181),new Point(82,190),new Point(82,195),new Point(83,200),new Point(84,205),new Point(88,213),new Point(91,216),new Point(96,219),new Point(103,222),new Point(108,224),new Point(111,224),new Point(120,224),new Point(133,223),new Point(142,222),new Point(152,218),new Point(160,214),new Point(167,210),new Point(173,204),new Point(178,198),new Point(179,196),new Point(182,188),new Point(182,177),new Point(178,167),new Point(170,150),new Point(163,138),new Point(152,130),new Point(143,129),new Point(140,131),new Point(129,136),new Point(126,139)));
    this.Unistrokes[4] = new Unistroke("triangle", new Array(new Point(414,146),new Point(409.9974569898224,152.40406881628417),new Point(409,154),new Point(405.67449818430185,158.5923596502498),new Point(401.2451860256495,164.70902882172206),new Point(396.81587386699715,170.82569799319432),new Point(396.81587386699715,170.82569799319435),new Point(392.38656170834486,176.9423671646666),new Point(392.3865617083448,176.94236716466665),new Point(388,183),new Point(387.9568957545266,183.05877851655464),new Point(387.95689575452656,183.0587785165547),new Point(383.4909273918142,189.1487353747989),new Point(383.4909273918141,189.14873537479895),new Point(379.02495902910175,195.23869223304314),new Point(379.0249590291017,195.2386922330432),new Point(374.55899066638926,201.32864909128736),new Point(374.5589906663892,201.32864909128745),new Point(370.09302230367683,207.4186059495316),new Point(370.0930223036768,207.4186059495317),new Point(366,213),new Point(366,213.6306543367036),new Point(366,213.6306543367037),new Point(366,218),new Point(369.17838851552375,217.8356005940246),new Point(369.1783885155239,217.8356005940246),new Point(376.7202895520903,217.44550226454703),new Point(376.7202895520905,217.44550226454703),new Point(384.26219058865684,217.05540393506945),new Point(384.26219058865706,217.05540393506945),new Point(391.80409162522335,216.66530560559187),new Point(391.80409162522363,216.66530560559187),new Point(399.34599266178986,216.27520727611432),new Point(399.3459926617902,216.2752072761143),new Point(406.8878936983564,215.88510894663673),new Point(406.8878936983568,215.8851089466367),new Point(414.4297947349229,215.49501061715915),new Point(414.42979473492335,215.49501061715912),new Point(421.9716957714894,215.10491228768157),new Point(421.9716957714899,215.10491228768154),new Point(424,215),new Point(429.5200209581283,214.89777738966427),new Point(429.52002095812884,214.89777738966427),new Point(437.07070941709384,214.75794982560936),new Point(437.07070941709435,214.75794982560936),new Point(444.62139787605935,214.61812226155445),new Point(444.62139787605986,214.61812226155445),new Point(452.17208633502486,214.47829469749954),new Point(452.17208633502537,214.47829469749954),new Point(459.72277479399037,214.33846713344462),new Point(459.7227747939909,214.33846713344462),new Point(467.2734632529559,214.1986395693897),new Point(467.2734632529564,214.1986395693897),new Point(474.8241517119214,214.0588120053348),new Point(474.8241517119219,214.0588120053348),new Point(482.3748401708869,213.9189844412799),new Point(482.3748401708874,213.9189844412799),new Point(489.9255286298524,213.77915687722498),new Point(489.9255286298529,213.77915687722498),new Point(497.4762170888179,213.63932931317007),new Point(497.47621708881843,213.63932931317007),new Point(505.02690554778343,213.49950174911515),new Point(505.02690554778394,213.49950174911515),new Point(512.577594006749,213.35967418506021),new Point(512.5775940067495,213.35967418506021),new Point(520.1282824657145,213.2198466210053),new Point(520.128282465715,213.2198466210053),new Point(527.67897092468,213.08001905695036),new Point(527.6789709246805,213.08001905695036),new Point(532,213),new Point(535.2268812837049,212.85332357801343),new Point(535.2268812837053,212.8533235780134),new Point(542.7710747645108,212.51040569252226),new Point(542.7710747645112,212.51040569252223),new Point(550.3152682453167,212.16748780703108),new Point(550.3152682453172,212.16748780703105),new Point(557.8594617261226,211.8245699215399),new Point(557.8594617261231,211.82456992153988),new Point(565.4036552069285,211.48165203604873),new Point(565.403655206929,211.4816520360487),new Point(572.9478486877344,211.13873415055753),new Point(572.9478486877349,211.1387341505575),new Point(576,211),new Point(578,209),new Point(576.4055186209835,208.509390344918),new Point(576.405518620983,208.50939034491785),new Point(569.1874917498136,206.28845899994263),new Point(569.1874917498131,206.2884589999425),new Point(561.9694648786437,204.06752765496728),new Point(561.9694648786433,204.06752765496714),new Point(554.7514380074739,201.84659630999192),new Point(554.7514380074734,201.8465963099918),new Point(552,201),new Point(547.5182759028878,199.67585424403504),new Point(547.5182759028874,199.6758542440349),new Point(540.2757904292288,197.53602899045399),new Point(540.2757904292283,197.53602899045384),new Point(533.0333049555697,195.3962037368729),new Point(533.0333049555693,195.39620373687276),new Point(525.7908194819107,193.25637848329183),new Point(525.7908194819103,193.25637848329168),new Point(518.5483340082517,191.11655322971075),new Point(518.5483340082512,191.1165532297106),new Point(511.3058485345927,188.97672797612967),new Point(511.30584853459226,188.97672797612952),new Point(508,188),new Point(504.328498327187,186.1642491635935),new Point(504.32849832718654,186.16424916359327),new Point(497.57379934339656,182.78689967169828),new Point(497.5737993433961,182.78689967169805),new Point(496,182),new Point(490.8191003596061,179.40955017980306),new Point(490.81910035960567,179.40955017980284),new Point(488,178),new Point(483.8800270607776,176.45501014779163),new Point(483.8800270607771,176.45501014779143),new Point(480,175),new Point(476.6936453831552,174.1734113457888),new Point(476.69364538315466,174.17341134578865),new Point(472,173),new Point(469.39053542108763,172.25443869173932),new Point(469.3905354210871,172.25443869173918),new Point(465,171),new Point(462.2277939562011,169.89111758248043),new Point(462.22779395620057,169.89111758248023),new Point(460,169),new Point(456,167),new Point(455.3544783440806,166.78482611469352),new Point(455.35447834408,166.78482611469335),new Point(450,165),new Point(448.6509340960709,163.6509340960709),new Point(448.6509340960705,163.65093409607047),new Point(448,163),new Point(445,162),new Point(441.98793815796955,160.27882180455404),new Point(441.98793815796904,160.27882180455376),new Point(438,158),new Point(435.192968634065,157.06432287802167),new Point(435.1929686340644,157.06432287802147),new Point(435,157),new Point(430,155),new Point(428.2438714206647,154.12193571033234),new Point(428.2438714206641,154.12193571033205),new Point(424,152),new Point(421.2766251361371,151.3191562840343),new Point(421.2766251361365,151.31915628403414),new Point(420,151),new Point(419,149),new Point(416,149),new Point(415.0000000000007,149),new Point(415,149)));
    this.Unistrokes[5] = new Unistroke("pentagon", new Array(new Point(441,304),new Point(441,301),new Point(442.6755603725863,295.97331888224113),new Point(445.2998040432231,288.10058787033074),new Point(447.92404771385986,280.22785685842035),new Point(448,280),new Point(449.7481134678881,272.13348939450356),new Point(451.54832977422166,264.03251601600243),new Point(452,262),new Point(453.50772035345625,255.96911858617506),new Point(455.520423371039,247.9183065158441),new Point(457.5331263886217,239.86749444551316),new Point(459,234),new Point(459.3699819422736,231.78010834635813),new Point(459.3699819422736,231.7801083463581),new Point(460.73426126324955,223.5944324205026),new Point(460.73426126324955,223.59443242050259),new Point(461,222),new Point(464,217),new Point(464.1399379976867,216.16037201388005),new Point(464.1399379976867,216.16037201388002),new Point(465,211),new Point(466,209),new Point(466.1366100076157,209.81966004569404),new Point(466.1366100076157,209.81966004569406),new Point(467.5008893285916,218.00533597154956),new Point(467.5008893285916,218.00533597154958),new Point(468,221),new Point(469.53783377846,226.03291054768738),new Point(469.53783377846,226.0329105476874),new Point(471.96283475844245,233.9692773912662),new Point(471.96283475844245,233.96927739126622),new Point(474.3878357384249,241.905644234845),new Point(474.3878357384249,241.90564423484503),new Point(476.8128367184073,249.84201107842384),new Point(479,257),new Point(479.3952664972261,257.7114796950069),new Point(483.42541667786253,264.9657500201526),new Point(484,266),new Point(484,268),new Point(485.6176465858597,272.85293975757895),new Point(485.6176465858597,272.852939757579),new Point(487,277),new Point(488.4097832916292,280.6654365582358),new Point(488.4097832916292,280.66543655823585),new Point(491.3888024607339,288.4108863979081),new Point(491.3888024607339,288.41088639790814),new Point(492,290),new Point(493,295),new Point(493.83036860570843,296.2455529085626),new Point(493.8303686057085,296.2455529085627),new Point(495,298),new Point(493,300),new Point(490.17772024716976,298.17381898346275),new Point(490.17772024716965,298.1738189834627),new Point(483.2104741425226,293.6656009157499),new Point(483.2104741425225,293.66560091574985),new Point(476.2432280378755,289.15738284803706),new Point(476.2432280378754,289.157382848037),new Point(476,289),new Point(468.70898257912654,285.68590117233026),new Point(468.7089825791264,285.6859011723302),new Point(461.15422704158163,282.25192138253715),new Point(461.1542270415815,282.2519213825371),new Point(454,279),new Point(453.5769640577555,278.87913258793014),new Point(453.57696405775533,278.8791325879301),new Point(447,277),new Point(445.69553047506724,276.3477652375336),new Point(445.6955304750671,276.34776523753357),new Point(443,275),new Point(438.2730484950946,272.6365242475473),new Point(438.2730484950945,272.63652424754724),new Point(433,270),new Point(430.8992779521328,268.8329321956294),new Point(430.89927795213276,268.8329321956293),new Point(424,265),new Point(423.6060283455911,264.90150708639777),new Point(423.606028345591,264.90150708639777),new Point(420,264),new Point(416,262),new Point(415.8926830543197,261.97853661086396),new Point(415.89268305431966,261.97853661086396),new Point(411,261),new Point(412.83550841917065,258.246737371244),new Point(412.8355084191707,258.24673737124397),new Point(413,258),new Point(420.5413499071015,255.32403712973817),new Point(420.54134990710156,255.32403712973814),new Point(428.36216867094146,252.54890789095626),new Point(428.3621686709415,252.54890789095623),new Point(436.1829874347814,249.77377865217434),new Point(436.18298743478147,249.77377865217431),new Point(444,247),new Point(444.0038314630256,246.99872284565814),new Point(444.0038314630257,246.9987228456581),new Point(451.876562474936,244.37447917502135),new Point(451.87656247493607,244.37447917502132),new Point(459.7492934868464,241.75023550438453),new Point(459.74929348684645,241.7502355043845),new Point(467.6220244987568,239.12599183374775),new Point(467.62202449875684,239.12599183374772),new Point(468,239),new Point(475.3051104497969,235.99201334420127),new Point(475.305110449797,235.99201334420124),new Point(482.9786322213467,232.83232790885725),new Point(482.97863222134674,232.83232790885722),new Point(485,232),new Point(490.8773766015312,230.3207495424197),new Point(490.87737660153124,230.32074954241966),new Point(492,230),new Point(495,229),new Point(498.7932608596033,227.83284281242976),new Point(498.7932608596034,227.83284281242973),new Point(506.7248762448018,225.39234577083022),new Point(506.72487624480186,225.3923457708302),new Point(508,225),new Point(514.7793320154366,223.40486305519136),new Point(514.7793320154367,223.40486305519136),new Point(522.8573192050642,221.5041601870437),new Point(522.8573192050643,221.50416018704368),new Point(525,221),new Point(525,223),new Point(521.8890278064554,225.66654759446686),new Point(521.8890278064553,225.66654759446692),new Point(518,229),new Point(515.5597950195283,231.03350415039313),new Point(515.5597950195282,231.03350415039318),new Point(512,234),new Point(509.40861452442215,236.59138547557785),new Point(509.4086145244221,236.59138547557794),new Point(509,237),new Point(504,242),new Point(503.5406272873547,242.45937271264532),new Point(503.54062728735465,242.45937271264538),new Point(497.67264005028727,248.32735994971276),new Point(497.6726400502872,248.32735994971281),new Point(493,253),new Point(491.9857142780266,254.35238096263126),new Point(491.98571427802653,254.35238096263132),new Point(490,257),new Point(487,258),new Point(485.7082674595849,259.2917325404151),new Point(485.7082674595848,259.2917325404152),new Point(479.84028022251744,265.15971977748256),new Point(479.8402802225174,265.1597197774826),new Point(479,266),new Point(473.97229298545,271.02770701455),new Point(473.97229298544994,271.02770701455006),new Point(468.10430574838256,276.89569425161744),new Point(468.1043057483825,276.8956942516175),new Point(468,277),new Point(461.0879009263229,281.32006192104814),new Point(461.08790092632285,281.3200619210482),new Point(460,282),new Point(454.4621554362207,286.307212438495),new Point(454.46215543622066,286.30721243849507),new Point(451,289),new Point(448.652490750139,292.130012333148),new Point(448.65249075013895,292.13001233314804),new Point(448,293),new Point(442,297)));
    //
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(points, useProtractor)
	{
		var t0 = Date.now();
		points = Resample(points, NumPoints);
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleTo(points, SquareSize);
		points = TranslateTo(points, Origin);
		var vector = Vectorize(points); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
		{
			var d;
			if (useProtractor) // for Protractor
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
			else // Golden Section Search (original $1)
				d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke index
			}
		}
		var t1 = Date.now();
		return (u == -1) ? new Result("No match.", 0.0, t1-t0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal, t1-t0);
	}
	this.AddGesture = function(name, points)
	{
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
}
//
// Private helper functions from here on down
//
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = Distance(points[i-1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i-1].X + ((I - D) / d) * (points[i].X - points[i-1].X);
			var qy = points[i-1].Y + ((I - D) / d) * (points[i].Y - points[i-1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i+1] * v2[i+1];
		b += v1[i] * v2[i+1] - v1[i+1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2)
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2)
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }
