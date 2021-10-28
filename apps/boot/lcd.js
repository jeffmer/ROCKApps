D7.set();

E.kickWatchdog();
function KickWd(){
  if( (typeof(BTN1)=='undefined')||(!BTN1.read()) ) E.kickWatchdog();
}
var wdint=setInterval(KickWd,5000);
E.enableWatchdog(20, false);

/* 
Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.

Updated for use in ROCK smartwatch by Jeff Magee
 */

function ST7789() {
    var LCD_WIDTH = 240;
    var LCD_HEIGHT = 280;
    var XOFF = 0;
    var YOFF = 24;
    var INVERSE = 1;
    var cmd = lcd_spi_unbuf.command;

    function dispinit(rst,fn) {
        if (rst) {
            digitalPulse(rst,0,10);
        } else {
            cmd(0x01); //ST7735_SWRESET: Software reset, 0 args, w/delay: 150 ms delay
        }
        setTimeout(function() {
        cmd(0x11); //SLPOUT
        setTimeout(function() {
            //MADCTL: Set Memory access control (directions), 1 arg: row addr/col addr, bottom to top refresh
            cmd(0x36, 0x00);
            //COLMOD: Set color mode, 1 arg, no delay: 16-bit color
            cmd(0x3a, 0x05);
            //PORCTRL: Porch control
            cmd(0xb2, [0x0b, 0x0b, 0x33, 0x00, 0x33]);
            //GCTRL: Gate control
            cmd(0xb7, 0x11);
            // VCOMS: VCOMS setting
            cmd(0xbb, 0x35);
            //LCMCTRL: CM control
            cmd(0xc0, 0x2c);
            //VDVVRHEN: VDV and VRH command enable
            cmd(0xc2, 0x01);
            // VRHS: VRH Set
            cmd(0xc3, 0x08);
            // VDVS: VDV Set
            cmd(0xc4, 0x20);
            //VCMOFSET: VCOM Offset Set .
            cmd(0xC6, 0x1F);
            //PWCTRL1: Power Control 1
            cmd(0xD0, [0xA4, 0xA1]);
            // PVGAMCTRL: Positive Voltage Gamma Control
            cmd(0xe0, [0xF0, 0x04, 0x0a, 0x0a, 0x08, 0x25, 0x33, 0x27, 0x3d, 0x38, 0x14, 0x14, 0x25, 0x2a]);
            // NVGAMCTRL: Negative Voltage Gamma Contro
            cmd(0xe1, [0xf0, 0x05, 0x08, 0x07, 0x06, 0x02, 0x26, 0x32, 0x3d, 0x3a, 0x16, 0x16, 0x26, 0x2c]);
            if (INVERSE) {
                //TFT_INVONN: Invert display, no args, no delay
                cmd(0x21);
            } else {
                //TFT_INVOFF: Don't invert display, no args, no delay
                cmd(0x20);
            }
            //TFT_NORON: Set Normal display on, no args, w/delay: 10 ms delay
            cmd(0x13);
            //TFT_DISPON: Set Main screen turn on, no args w/delay: 100 ms delay
            cmd(0x29);
            if (fn) fn();
          }, 50);
          }, 120);
    }

    function connect(options , callback) {
        var spi=options.spi, dc=options.dc, ce=options.cs, rst=options.rst;
        var g = lcd_spi_unbuf.connect(options.spi, {
            dc: options.dc,
            cs: options.cs,
            height: LCD_HEIGHT,
            width: LCD_WIDTH,
            colstart: XOFF,
            rowstart: YOFF
        });
        g.lcd_sleep = function(){cmd(0x10);cmd(0x28);};
        g.lcd_wake = function(){cmd(0x29);cmd(0x11);};
        dispinit(rst, ()=>{g.clear().setFont("Vector",24).drawString("P8 Expruino",40,100);});
        return g;
    }

    //var spi = new SPI();
    SPI1.setup({sck:D45, mosi:D44, baud: 32000000});

    return connect({spi:SPI1, dc:D47, cs:D3, rst:D2});
}

E.showMessage = function(msg,title) {
    g.clear(1); // clear screen
    g.setFont("Vector",18).setFontAlign(0,0);
    var W = g.getWidth();
    var H = g.getHeight()-26;
    if (title) {
      g.drawString(title,W/2,18);
      var w = (g.stringWidth(title)+12)/2;
      g.fillRect((W/2)-w,26,(W/2)+w,26);
    }
    var lines = g.wrapString(msg,W-2);
    var offset = 26+(H - lines.length*18)/2 ;
    lines.forEach((line,y)=>g.drawString(line,W/2,offset+y*18));
    g.flip();
};

