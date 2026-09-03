
<div class="letter-overlay" id="letterOverlay">
  <div class="letter-toolbar">
    <strong>Offer Letter</strong>
    <span id="letterName" style="opacity:.85"></span>
    <span id="letterEditStatus" style="font-size:12px;opacity:.9;margin-left:8px"></span>
    <div class="lt-actions">
      <label class="wm-ctl" title="Show a SAMPLE watermark on this letter (print / PDF)"><input type="checkbox" id="letterWmOn"> Watermark</label>
      <button class="btn-light" id="letterRegen" title="Rebuild the letter from the current fields (replaces manual edits)">Regenerate</button>
      <button class="btn-light" id="letterShare">Export / Share (HTML)</button>
      <button class="btn-light" id="letterDoc">Word (.doc)</button>
      <label class="email-pref">Email in
        <select id="emailClientPref"><option value="desktop">Desktop Outlook</option><option value="web">Outlook Web</option></select>
      </label>
      <button class="btn-light" id="letterEmail">✉ Email</button>
      <button class="btn-primary" id="letterPrint">Print / Save as PDF</button>
      <button class="btn-ghost" id="letterClose">Back to Pipeline</button>
    </div>
  </div>
  <div class="letter-body-wrap">
    <div class="letter-options" id="letterOptions"></div>
    <div class="letter-preview-area">
      <div class="letter-sheet" id="letterSheet">
        <div class="watermark-layer" id="wmLayer"></div>
        <div class="letter-content" id="letterContent" contenteditable="true"></div>
        <div class="letter-print-footer">All Western Mortgage, Inc. &nbsp;&bull;&nbsp; 8345 W. Sunset Rd. #380<br>Las Vegas, NV 89113 &nbsp;&bull;&nbsp; Main 702.369.0905 &nbsp;&bull;&nbsp; Fax 702.920.8421</div>
      </div>
    </div>
  </div>
</div>

<script>
/* ===================== OFFER LETTER GENERATOR ===================== */
const AWM_LOGO="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAB9CAYAAABUHpEuAAAvKUlEQVR4nO2dW3BT19n3l6StsyVtWxhDsLFw2jdMbMYiM+WUzFiEJilvJ6Cm3xfCFaIlXMbKhJuXHlCSNr1JJnIvE/qi3LyEzDQRMN/QtB9BzLQG0pkgxiZDvikgYxpjjG2dD1tb0nchFmwv77MOluH5zWgSrH1Ye2vv9aznWf/nWQgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQKujWeoGIISQxmKj9esG3MYN2zy6lT0u3coel9Zqpw19A4N82+fHRs8jhFAlk4gXb16NljOJePHG1Wjx5ni0kk3Fm9p4AAAAAGgBlsygayw22rRlp9fy/B6facO2oXodl52enCjeHI8Wb16NFsZGI8zVC5F6HRsAAAAAWpWmG3SNxUa37Trot+563a+zOhzNOGd+bPQ8Mz4ayV08E2Zj30abcU4AAAAAaCZNNejGzS9524dHQs0y5HyUMolE/uJfwrlLZ8LM2GgEQvQAAADAo0DTDDr9RjBk3bFnXy3HwJ42e3cyVpqejAltp+/rd2utDlq/rt+tW9njEpqLRwihzNkTn+QunQkXLn0ZrqVtAAAAALCUNMWg12LM82Oj57NfnQjlL54J1+JNG/q3evR9/W7jwDaPYcM2DxklwJ57+tRHQQjLAwAAAMuNhht022tvBex7Dx1Ruh87PTkxPzLsa5SojXI97TZu2OYxbd7pJUV5zI3xK+nTHwdrHUQAAAAAQLNoqEE39G/1dL73+Tml++Uunjk5PzLsa5YxxYp78+afeM1bdu7Gfy9lEons2ROh9KmPg+WZ27FmtAUAAAAA1NBQg+783Z8jSlPSchfPnJz7wy+8DWqSJELGPXP2xCfZsydCkAYHAAAAtCINM+hqvHN2enLirn+Hu1XC3NrObpd5y0+8bS8f9FNdPb0IVef0U8ffD4BhBwAAAFqJhhl0NUK4mcOvbG9VQ2no3+qx7Njjw9cEhh0AAABoJRpm0Ff9z7W4knxz5sb4lZk3X3A3qj31AhfGsTy/x0d19fTmx0bPJ47+xg/KeAAAAGAp0TbioJTrabfS4jHp0x8HG9GWelPJpuKpTz8ITB/c5JobGd5PrexxdY2cvUy/EQxpO7tdS90+AAAA4PGkIQZda3XQSvfJXzwTrn9LGkvuq89C0wc3uWYOv7Jdt7LHtXLk/0Ztr70V0Fhs9FK3DQAAAHi8aIhB13X1uJRsz9wYv9IqQjg1MFcvRGZ//XPP3O/3ew0D2zwrg2ejxs0veZe6XQAAAMDjQ2NC7iuVGfTSXeEyrssJbNjnR4Z9bS8f9Hf813+HIQwPAAAANIOGGHRWoYEu3rwabUQ7lgps2NOnPg7SB94JWl8+4F/qNgFLT3tHh2vNmm73UrcDAIBHk4YYdLGFUx4nmKsXInN/+IW3eONqFERzwJYtW30//1//O7jU7QAA4NGEWuoGPA4wVy9EmKsXIsbNL3lLVjsNKW4AAABAvWmIQYdiK/zAEq0AAABAo2hIyB2hqnJd7raGgW2eRrUDAAAAAB4HGmbQC+OjEdmNsNrpRrUDAAAAAB4HWsKgG/oGBhvVDhLK5PRYnQPBZp0PAAAAAJpB4wz6pS/DpUwiIXd7Q/9WT6PagqFMTk9793PnLO1PDlvanwo0+nwAAAAA0CwaZtARQih/8S9hudvq+/rdjWtJFTP9pP/h//f5kYaiG31OAAAAAGgGDTXouUvy67Nbnt/ja1xLENJSZpepbfXuB//WGRwm+9qGnhMAAAAAmkVDDXrh0pdhdnpyQs62hr6BwUYuamKyLTbeZrrP36jzAQ/RGezuVouG6Ax291K3AQAAoJ401KAjhFD69EdBudtadjTOSzfaexYdm9Jbew2WVd5GnROo6hY61m6/TK95NrLUbcEYbT2+jrXbLxtti5+JRwktZXYtdRsAAGgeDa8Ulz17ImTbeyggZ310y/N7fJnTR4P1boPBsspL6a29fN8Z7Wt9TPZOWO6xKJPTY+14KmCwdA6paQuTnTmfvjfuLzHJqJr9SazOgSDLJKKF1GSoHsfTGexuS8f6AHd6QopyiUkUMnfC6buXfeR3BvMKD0II6U30oNHW46tXO9Wipcwue9czxxBCyGBd7V3q9jQMDUXbV20KM5k74ez8dwEluxosq7yU0eGW2o4tJKKS746Goi0c7YoY2fj1IKqwcTnb8mG09fh0lMUl9H25XIznEzeCkgfSULTBvMIjp18Qu1clNhsrpKfCcq+fRG92emT1FRqKNtnX+ozWalu0OsODvraYj18psblYIXkrxL0eLWV2tfd4okxuNlIqJMSPLwOd0eHWaik68f2oB6FqP2K0rvYqPY5Gq6cpo9296LoVPEcYtpCIskwiWmZzMaXtoLuHornEjaCa/qFuz6EKGm7QK9lUPHPq46B976EjUtsa+gYGDf1bPfWuNGcUmSs3ta3enaHMLrk/OltIRAuZO+FibjZisK7y6k20rJQ7bPSKuXuRehlzyuT0WNqfHEYIodncvYiaB5ekxCSjTGYqXCokolLXVy4xCbaQiBZzs5FCZirMt42O09lZOp4KLLUBtXSsD+D/12pbaxqgnhjbVnv1JnpQp7e4lBpKlklENTo9rTev8Jjta/eR32fnr48UMlPhMpuNSR6swsaZ3L2IwbzCY6b7/Fxjg1DV4GTnvguUy8V4LcYcoeq7qaMsLr7z5NNTJwtz1wJyjmPtWB8w2Xt8s7G/uaTaxDJVY2jr2hjinjM1M/ZmMXcvgq9fp7e42lYMBMl2SaHR6mmx7ymT0+NYvSmMj8sWMxNsIRHVaPW03kQP6k30oB7Rg6a21btn/nVSg/fTm1d4tDqDw9S2ejdSMHiXQnu/Ly0VszEmdy9CGR1ua8dTAaXXXSkX4wv/UL2PWq2etnQ8FZDb7yJUfcbS98b9bH42Inef6r175lgSIaS0z2LvD5AM1tVermNULjGJ9L1xP1uHAZQQTanlnj71UdC663W/LC99xx5fPQ06KYbjw2Rb65PtxVTYB6Or7Px3gbaVG0N8nR5J+t64v97GjCvqs3SsD/B5yGrA7czOfxewrdoU5rt/bDEzMX8r4pbq8LhGk9Jbe5fSS9dSZhf3t1IbZVkOmB1VfYhWZ3AY25RFIspsLlZITYYK6amw0brKy+2M2WJmIjM77lfSFjY/G8GdqdW5fsHAPjv3XUBJhEyMEpOMZplktMRmYzgKg5E9kNZQNB4ky7lvZTYXY9hcjC0kovh5Ss2Mvcn1wO5fP6qUinHHE5u/4O6fS976pFxcODDSGR1u/M4tMmwccBouQlVjkZj62ss1WlrK7LKt3BgyWDqHmOzMee6++vuRMzwoL5fZOOmpG+09Pm5kk8nOnC/mFhpFvdnp0eotLrzdA6eiwsa5v7utc8OH3P0ys9feJq+He918zgk+Fsskok7Xize536Vmxt58YEiJwaPeRA+2dz93bv7237crMeoIIWTvUm7US0wyWmKS0UJ6KkwZPVF8bzJz3zXcoWmKQa9kU/HU8fcD9IF3P5Ta1rpjz77k8fcD5ZnbsXqcm08MR2Km+/xKw5KY9MyYn+z0+CgVZXgzStBQNNc4me1r96Vnxvy1ejkkpUIiyjeCT01f9sk5F2k0l9JL53rnD9BQdL3v2VKjM9jdXA/G7OhTN5issHGuoUIIIdL4KIHJ3YtYEVpg0MsiBksthfRUGHWhBQZdb17hkRPm5A6Sldw3HHYvl5iE0Hn4rjWfvBXiMzK5+8ZabBBi69r4oG2FzJ0weZwym4slvh/1tPf+OEbuq6PMrnx66mTqztdeoePrzU4P4hj0Ym42sqifnK/+x2jr8ZGDKAyfRyrU3xYdfX7S+JPwGvtCIvrA4OdnI9n49SC95tkI9z1wrN4Unp+MuKUimaRg1t71zLG5QiKqOLJaYePlYjaG72EjPXNMw0VxmMzpo0G5inf73kOBep2XTwxHotUZHKoFUhU2notLdxRy5iSVYGxbPD/VrDQ8tpiZkDPS5RNlYS+9Ac2SbAtfJKXev0srYCbmGvUmelCtqr9cXoaDnQobz6enTnL/ZDA7PXJ2NXGeTb2JHqRM0vtpKbMLD+gLmfpEG6TeL1IXlBWZTigkFw9KymU2nrk35lffQuIcqckQW8zI6t/FyCdv1eU4qMLGk3e+9pZLzIPiZlqdwYEjE2LwTXPQa56NqHmHyIhGo2maQUcIofmRYZ+c7aw79uyrx9rhYmI4ElMNRiafuhWS2kbOg6QEHFJd8LcGpOHpeTpCOQMYhBDSCghDLB3Nr9InFKl55Ay6hqKN1sWZG6SRl0s9BFNLAUNoOrQ6g0OqQyYjGwjJGyQbOOKvXPx6UEEzRZmN/XWd0Hfkcys2155P3QqVCK80dedrbz00NwuOOV2HKb8KG09OCUcNlFBmczFygKW2H9bqDA61Rr2ZNNWgM1cvRHIXz5yU3hIh+sA7wVrPJyaGIzFYOofUpvmU2VyM9AgWHV+mhyAHLWV28YlCKL21V45HoQS+eWaysxRCyFg2PV1QQ9FCgx2thOhouWFsW807/WO0rvK2Wi2ARlJIL35GpTpz3loV9rX7pO4bHkCxxcxEvQSvCPGHloUQm1oss7lYvfQ1YiidnxainveQIZ4DXQ2pnMvBqDfVoCOEUPzob/1yarybt+zcXUt9dzliOBI58+1CSBk5OR6CXMwOYW9LrSfGB5/RzaenTsrtaMSMZTOL+ljoJxepnjF8EYjlDI7c5NNTJ7lCKCyOW6p2NR2esDtf5IKLSWB6TtRL11A0HvQyafFwu5jATSklIsPAZO/xtbKhWSpq1WgU8/EFy4C3ulFvukEvz9yOpY6/H5CzraMGL12NcZYz3y4En0dAUq+wu6FNuGMyta3eXa+CIgYeAyDXO0dI3FgaLJ1D9Y4m8CLinSMknRa0nOCGjAvJW6E8Iejim6Z5lCkkF06FGSydQ0LetsHyUNiaS976hPud2PPDHSRJTb3VUxhbzN2LcP+NDU1T3qllDFtQ5v2n7437l5NRb7pBR6gqkMuPjZ6X2s7QNzBoffmAX8051BjnmkLBPB4BST0MOmVyeqR0AbVEGriQBrlcYhJyBi4YrV64uAJCCFmbMJcu5p0jVBU+NboNzQJHZ8olJsFk74TJ30quyOtRgcneCXNFUQjxi0kRejh4zaenTpICM7F+Ab/TcsLtOon3QQllNhcjBx5ancHR3v3cOdNjNnATg4wS5hLKNQ7xf//Ds1yM+pIYdISqAjk5oXfb3kMBpQI5ITEc+aPwoWTenUTKe1U6BcB7DBntq0c4W2ewu8l7WMjcCStJ8ZIaeDTDS5eV5fAolEjliOHyWNVcYeNkp/+4LUgkSxTFSQFlMlNhPk2MUL+A77kcoajcuWEtZXYZbT0+26pNYbHtsnPXAuSABaFqzrdt1aZwS2smeNqmpcwuS/tTAanrVgL3987OXx9RJQSssPF6GPVHKm2NpDxzOyZH9a6zOhztwyMhJcfme/nKJSaRFMm5xNQSspbjvdZkwAQUzCQ1peHdh69sIykwEUPuQ95IL91oW1gYQwghNf5ygiuG44Z+yd9MjsjrUYK8fr73B3vt5RKTwHnnZLier1+gTE4PvudKpqK4tHc/d67zB7sr3I/T9eJNe9czx6QqGZbZXCx9j7/Ij6lt9W56zbORVh2sdj7503m+67Y61x+ppdbBAjQUjXURxXz8SkZmpUBeeNLgEHpo1GXd5ybUu1gyg45QdTW2zNkTn0htZ9qwbUhu6F1IDFfI3OEdefOeT23IWkbYXU194wf7CiiY+aglDQ8hhAxEx4fDuHL3F6tlvOA8DfTS5abHPQqpa3h+vJiPX+F6gnxh58fJSyevX6szOMjnDd87rjfPZO+EyXxoUoyK3+ViPn5FbQpYMR+/wmRnzuMP9zsy1YyPQmoylJz+Zj/fd3oTPdje44m2olEXu2414kEytK6lzC56zbMRrc7gKObjV+L//oenVoNaZnOx+L//4eEz6vYWiYgsqUFHCKHE0d/4mRvjkqFw295DAcr1tFtqOyFjjPNDyZE3H7WI46RG6rWoqpUY6VrS8PjS4pQWzFBiJBvhpcv1zhGSP/hoVbhiOFIIhxAnBH+fx23ZYPLZ5Q6quc86mUNOhtFJFTwWp/Ldc7mk7437E9+PevBn5l8nNbOxv64r5uNX5Hqq2Kjzhd9bydhwid8+7+a7brVFZRxPbP6ivffHMccT2yJ091DU6Xrxpt5ED5ZLTKIexhxTYpJRPqOuN9GD9JpnI0t9n5fcoFeyqbic+XS5oXc+Y8z1Wvg8FpJaxHFSYXe9iR5UY2i1lNlF5oSTI1sS3lKnMuCbZ1RaMENKEMellsGHEEqK11DG1hK2KIWbqlguZmOUyenhfsgUp0bUK2hlyLA7N0sEe91kZAOhatUy7r+5U1layvygfrnacLsQZTYXYxQOoAupyRDfPC9C1T7HqrIvaCZlNhdj0nfC5PMql2q/3TnEdUa0OoOj3hEpJUadIbIRGs2SG3SEEGJj30blzKcb+gYG7b98Oyj4vYAYLkfUVpbjbaoWxzVI7U5GHpjszPmURLEItcVEDMS0gJqCGUoLOKgdfPDB9xyIDeKUDD5aDkJX4Xhi8xft3c+d4374amM/zmF3Sm/txRoPUS+bT1R436Ab6hBuF6OQmQoLrWAoBDY0fAN9k73Ht9TeoxwKmakwmZInh/nbf98+86+Tmpl/ndQkvr/0M+53ts4NH9Z7ANuqnnpLGHSEqvPpyePvL1qBh8S26+Cw+flXfXzfCYnhSK9ZjrdZizhOasROGkw5kJGHfGoyVGZzMTEvXW0xEVKDIFUwgw8ymiAVSjPb1+6rl5dOhpSZ7Mx5sUGc3NB8K7JADJeeOpmZvfY234ccZD5u4jjy9zfZ1vq4Az/SG8eQfYXB0jlUXeu79nC7GHjFLsU7Vth44vvRRUZdqzM4DHUuP90I2PxszctAM9k74ez89RHu3xyrN4XV9C9iqYataNRbxqAjhFDq0w8CckrDOg68EyTn04XEcPnkZIicPykxyaicuRq14jipsLvSMrC8KWT3zyHVoSgtJsJbHU5GrfoF8DzImZlxv9Q9r4eXTpmcHnIwkZn7LiA1H9lq+aRywb9vucQkUne+9mbnvwvwfVLT3/jIfR8rL53MyTc7PTj3PJe89YnQHGuJSUbJMLalY33gQXU4BV50M6c5ElOLFdmPgvhTLpnZhQVh1GoJpPQ1Uka92aWlW8qgI1TNT5cSyemsDofzcCissdho/DdBMZxAIQG+FYhIVIvjJMLuWp3BoWSOniznyu2ApFY5UlpMhKwOpybcztdxlMvFeHZOfInaenjppMAOrwwnlQO6HCvGLRDDST3PPM/k4ySOI8PuehM9+DBvX3zASk7ZYcehUeF2OVjaJTQiFTaekXjfHnVSdy/7yN+8rXNDsN7nETPq3CVum0HLGfRKNhW/96tXPFIiOaqrp3fF7z+P4H/zzYMy2ZnzQi+cHK+zFnGctNpdfviLzJ0lvQ2pwYkST4xU4asJt/OFqdj8bKSQnpIUJNbipfN553gQIVXTeTmEI0m4Az05FbDIDA854jhVWRkaiq5nuLFeUzFk2F2rMzjkLAVcSE2G+J7bRoXbFyBwH63O9Uek7rGaueiWoQ7PT4lJRslBjdm+dl8jKukJGXW5acb1ouUMOkL3jfphaaNu6BsYpN8IhhBCKD0ztqjmrtgLV2ZzsUZWjpMMu4vUY19wfluPj/tQsMXMBJkPLjU4kTtfyhfaVxxuRyJhKhlrx9fipZORDLaYmcCFQqQ89GUnjOOI4eR6inwZHvVczAdjoZ/01y2cr6Fox5pnI/U4FF9hJLlLAfNFQOqtbufD1vVMSOh9kBqEku9hsxXXtdC+1hOtx3HyiRtBMjJl69zwoVjhLbWDeyGj3kxa0qAjVFW+3zv8ikdqO+uOPfvsv3w7SJbn41Z9EoIMpfGhWhwnEXbnKm3FIAV0fN44X11nEjkdLBk1ULsc5CIvnyPQycavBxvhpfNpKBaE+CXyUGtZVnEp4NaoV+IpkoZJ6fMtZx7WTPf55c4dSh3PUscBB9+ARircjiEjIGwxM1GPcLvofdJQtKlt9W7yPLjfkHI2uFMqciIRi05PtK2e01JifR83JbAepKa/8ZHOW9uKgWAjdDNLbdRb1qAjVDXqcyPDvFWQuDxQvnOMupyRt9yFRtSK46RG8FJV4/iMlJDHLNUxyZkvJQvXqAm3IyTx4svw0tWk25GDAK53jhHLCFhWgiFiBTkloVW+0Lxtpfx5Pq3O4GhbuTHE1xnqDHa3bdWmsFZncPB5g3zGy0z3+Q0Wnt9bQ9FGW4/PTPf561YKFC0Mu4uJ4UjIKpNq3g2+67d0PBXgG1DhSmd8x8Hvl6lt9W6h8DE5/ZSZ4S8RKwZZXEptvQa+d8vSsT7A947rDHa3XaqWO18deIk+hyzbKnd1OjVTTktp1Klmn1Apua8+C80hhDqGR46JbdcxPHJs7v728X//w6PVyRhN3veipRZNMdp7fNl55QKTQnoqjLqQYLsN1lVeseOS3rmYJoDNz0bYYmZCaGSL9QCC5Vs1FE2+wGpWJkJocUdQzC30DPKpWyGrc/0Rof21OoPDQj/pl3vPtZTZhRfXwPAJ8Mpl4c672XNdatFSZpdt5cYQt72U0eGWG0kps7kY+ZwYLJ1DbSs3htJEXQO+YkYIVadFyPu9+DyLjTCfR0nprb2OJzZ/IXYsOSVQ5cKkp8K47UqLJRWSt0K4r1AzFcW3HLHeRA86XS/eFNqHT/DKvbe2zg0fmmw9PiZzJ8zk7kUoo8NNGR1u7u+TnP5mv5KyzQjxK/Ipo8OtM9hlP2sYvvr5prbVu01tP50X2kds8M0XbTTa1/rErhGXbcXlYBF6uDpddv76SC5xPVhmczGkoWiuGBqnKSq9ZmzUuedrBi3toWNyX30WkuOpdwyPHMOeutxwmJxSsKrFcRJhd6mqcaRXLRValVKRi4XoyHx1tQpePs+NFKTJmSIw031+uV466Z0LTbeUJObRW7l6ms5gdzue2BZxul68SRpZe9czx+juoahcnQSvp2xfu6/zB7srdPdQlDJ1PIfLZ6ppay556xPus2N1DgQ7f7C7oma1wXKJSSg1vGLgGu1Mdua80k4a76t0Kgpfv9QgiPecPJGAMpuLZWavPajZoTfRg1bn+iO4iBA+Tz49dXI29td1UlOPXCiT09Pe++NYe/dz58jvtDqDo2Pt9svOdTvjclZEa1u5MdT5g90VvkGhFKQTgFBVT+RctzPOWyipbfXuzh/srrT3/jgm1FeXmGR0NvY3V3b++gg3BG9pf3LY6XrxpnPdznjnkz+dJ50ifM1KxXTYqONnRsm+atE04yT1wvz8qz4pTx0hhGYOv7KduXohIve4znU741KjqHx66mRKxmptJEZbj8/e9Yxgm1MzY2/meebydQa7u2Pt9sv43+USk5iN/c0lGiLUULTT9UJM7FpmY39dx2eobas2hbkdrlC7pKBMTg/ZGczf/vt2cv5OS5ldUgYjM3vtbSkvne84QvuZHH1+vs4Ak/j+0s+UejJK2PmfPw388If/4fnjyIeeRp0DkIYyOT1sIRFVU98bD1hVFX1pAJTJ6dHpLS6uAI7J3YuovT6gAWgoWqe3uJrxzCwLDx0j21P/1bGwnIVcMHJKwZraVu9Wk0ohWdtdQFFJqo9lrUVeYeNS10KuGIUhi92oVfDyKUT5Vk+ql5dO6hvKJSaRFfDopJTuy2oeHVANm5+NqDV2qiu4NQg2PxsppCZD3CJCtVwf0AAqbLxZz8yyMugIyTPqOqvDseK9zyPGzS95ZR1TZkhPleJWIuwuNFAg551kq3ElroVcMQqhanU4rldfS8EMPkGc0MMsdU14Ll34ZAvFYQjdT0MS6Mz45nUXnG+5pa4BAABwWHYGHSEFRv1w6Auhuu9c5JaCVVs5TlLtTsxfkwZWScpJiUlGJeu7E2p2MkpQS8EMUgkrpvRk87MRqRXjxLx0buoWPpeQd45QNSogdq7llroGAADAZVkadIRUCOUkkFMKVq04TrLIDKFmJ8VrcotfYKQMMpmeRha5qaVgBhm2lgpzS5WnFFz+UKF3jhErJqRGvAMAANAqLEuDbrCs8uoMdnc9jbrcNBRVlePkhN0x94tJcL9XamCFSlVicCoGQouLONRan5oU5EmlHOF0O7Ft+HLoSe8cIXm/Id98/gIeoxXIAAB4tFiWBt3aORCk1zwbwUZ9enjHRqkysR3DI8fE1lKXWooUo7ZynOSSqvc9f9IbzaenTqoxsJIlVu/PTZPRgZrC7TxpX3KKgkil21F6ay85TUBOf5CpUkKwBXFxCgjjAABYrrR8YRkSyuT0YI+SXvNsJDH1tZeNfRu5d/gVz4r3Po/orA7BlC3broPDWquDjv/R7+P7Pp+aDMkJu5psaxUXmpEsMtO22stk74TJcLicPHk+pIq3GK2rvGlOPXBMLQs68C3KUpIQoiF0f8W4jqcCYuUeLR1PBXA+rdHW4yO3zc5dC8hpo5SHrtNbXGx+Vs6hAGDJsb32ViB96qNgJZuKy9ne/PyrvsLYaKQ8czsmtp2hf6tH39fv1lodNEIIsXcnY8Ub41E29m1UaB/K9fSD7bmUM4k4dz+NxUbr1w245bSX3Bej7ex26fv63Yb7x2HvTsZK05Mxoe1JjJtf8mqtDjr31WchOe3gOydzczxaSSfj7N3JGHk/pa6xeHM8Kvc3U8KyM+hcDxZX+klOf7O/EPs2NH3gR64Vv/88YugbGBTa37pjzz79un73vV+94iFvaCE9FS6vYIJSOemqKsdJVKUzWld5c5zlMBHiX4hFLrhUpdD58Nw0dwCjtnY7hm9RlpLMsp3Zue8CYvn62EsvpCZDFmKJVLneOULVHF0rQoIDHan1jwGgVdB2drvsew8dQQih1KcfBKS2N/Rv9XQMjxybOfzKdkbAoJuff9XnOPBOUGd1ONjpyQn27mQMIYSsff1undXhyI+Nnk8dfz/AV+fDceDdoGnDtuo68TfGr+i6elzYwSplEonE0d/6c199FtJYHXTne58vKlzDR35s9Pzsr3/uwf/WWGy048C7QeuOPfsQQgi30YAQwudmpycncpfOhJN/OuLnO6bGYqPbh0dCOqvD8f3FM2Epw0q5nnaT11bOJOOmzT/xYlvD3Bi/kv3qRChz+mgQIYT06wbcYteotFaKXJaXQddQNF+1pbYVA8FCeiqMl16VMuqGvoHBlcGz0dn3fN4Fo7n7edxSFZ0ky6gKwGSmwmIGlqypLUeoJ0Yufj0oVp2LLLKitnY7Rse3DroMDx0h+V46QtX7z/27XO8cIRkeOoTcgWUCtbLHhRBC1l2v++V46ba9hwIIIaTv63eTxkRjsdEdh0Nh04ZtQ+z05MTM7/d7yW2sLx/w2/YeCnS+9/m51KmPRkiDWckk4ggtNMLazm6X8/CxsKFvYLBjeOTY1NhopJJJxGcOv7IdoYceuPN3f46YNmwbSh5//+3Upx8EDP1bPfh7fHzuYCM/Nnp+fmTYx/WMNRYb3bbroN++99AR8+adXiGDbtqy04sHGpYde3zYCPNhffmAnz7w7ocIIZQ69dFI6vj7Ae591nZ2u+gD7wTNW3buLt686uY7xtSBH63D7cSee/HmeFTonLWwrObQhVYMy8x9F8Dq5ko2FZ958wV35uwJ0aIlVFdPL1+uutx8bzXiOMkiM0QNdDX1ornIEZzV83xa7WJBmZL5fzlz6aQXr8Q7R0i6whffNQBAK6Lrqhp0ndXhaNt10C+2rfn5V33Yw+QLi2MPtJRJJO76dywy+AghlDl9NIhXwLTtOjhM9p3Fm1ej5D7lmdux2ff2P9jOvOUn3ko2FWeuXogwVy9EhMLj5Pfazm4XNua5i2dOzv765x4yzF3JpuKpTz8IxI/+5s3sVydCQvfC/lp1YIMQQm0vC983Q/9WDzbm8aO/eTP5pyN+ctBUnrkdm/vDL7yZsyc+yV06E+Y7Dred+NobEW5HaJkZdD61c7nEJPiMcPyPfl/y+Ptvk3/ngnPVba+9FcB/k2sEVYnjJNTuXMQWYlGC3JS3WsPtCC1O+5Kz3jyXQmoypLTmsZo631IZAEqPBwBLAfbQEULIvvfQEW1nt0toW64R06/rd3O/M25+yYtD2Imjv11ktLiwsW+j2FlqHx4JaSw2WqqdFY6XXc4kBY8tBg6RlzKJxPzIsE9s28zpo0GhKQjj5pe8VFdPL86Oorp6eoUKkLUPj4QQqkYcxLx4hKr2pnDpy7DUdTSaZWPQuWI4LmIlUVOffhC4957vZ1IKePveQ0c6/uu/w/jhTE597ZVl1FUsqyo3Ba0WtfmC4yRviaawYWoNt/MNbiRTxHiQ8tK5qFlgAyHp3Hg1WQwA0Gz06/rd+bHR87h/s+99aLS5WF8+4Ke6enqxIdYQHrr1+T0+hKrz3HJEYtmzVe9XZ3U4TFt2eqW2525TGBuNSG3Pe4z70YXs2ROhWrzbtpcP+vNjo+dzX30Wyo+Nnsd/I7cz9G/1UF09vQghlBfwvMVoxPy4HJaNQRcKt0uFyAuXvgzfO/yKh7kxLuotmrfs3L0yeDZKuZ52l5hkdP5WxC2r1rhC5KzBzreWt2pk1HdHqA7hdh4xmVSKGB9KvHSpojRCSOXG810LALQaGquDZsZHI6nj7wcQqgp+yTUsNBYbbdt7KJA8/v7bOCTM9ewRqgq4EEKoeGNxyJwP7vwveSyMtrPbZejf6rH/8u1gx/DIsVImkZgbGd4vpa7ng3tNpfsiPTUY+rd6TBu2DaVPfxRECCEcljdt2DZE3jc8nYGQ/PsihO21twLcj1j6dK0sD4MuIIaTWxKVjX0bvferVzxy5tW7Rs5etr58wI8qbDx997IvOf3NfiEPl6+MqiQywu61iuFIpMLS9Qi38+Vvq/HQEZLnpTPZmfNyy+GSSOXGQy46sBwwbdg2VM4k4pnTR4Ps9OQEQtW5cO42WAiXPvVRsJKuhrux54kh/y2FlIes7+t3rz76z5ud731+zrJjj29uZHj/9IEfuZSkiHHhzvnXYlwtO/b42OnJCRwaz331WQjfN1KDwB2o1OptGwa2ebgfoUFQPVgWBl3IO1di+CrZVDz+R79vbmR4v1QInj7w7oc4BF9ITYbmJyNuoaIzZN64HKTC7rV6yyQlJhkVm8+uNdyOEH+6F6Myp72QmgxJFflR650jJB1yh9Q1oNXB8+XYwOF5ZdOGbUN4Tljb2e2y7To4nDn1cbCSTcW5inHufDvuD7VWOy3n3FiBLkTxxtVo6tRHIwhVw/Jaq52ulwhM0ybeRttrbwXWnJyqrDk5VeH+XdvZ7bLu2LOP6urpxd+vOTlVwYMZ6449+4Q0CGLaBIQQot8IhtacnKqs+p9rcb7vZ3/9cw/3M/eHX3jFjlcLy8KgC4W21Ri+3FefheSG4LuO/jNm3PySt8zmYonvRz2pmbE3SW/dYOkcUjrnKhZ2V1sZToqcyNrm9RhAkIuy1IqYwa7FO0cIobJE5EBvXlzxDgBaCdLLY65eiOA5YfqX7wY1FhtNH3gnyE5PTmCBGFdRzt0fDwrEUn25cI0qI5B+lfzTEX/u4pmTCFUdJKlBgBgsJ8xuHNgmehyhOXr73kOBUiaRmDn8ynbygwc0bbte9+Ptuddl3CB+TjwNUGtovh60vEEXEsPVogLHIXg8ihQCq+Dtv3w7qLHY6HziRpDPW7d0rA8oaoBI2F2NalsOQvXd6xFuR6j+YWqxldhqFQxKeeh6Ez0IwjiglcFGhut147l0qqunt314JGTesnN38tPq30j0fQ+V7twULzkLWWERGXNj/IqYsnt+ZNiHHaeOXx0LS3m6QpRnbsfwYMWyY49P6XGwd56/+JcwTofjfrDIz7Jjjw8LowuXvgzjcLz9tUMBOWp+LrUMYGqh5Q26oBiuxk69kk3Fk3864ueO0ISw7To4vDJ4Nmro3+rB3nri+0s/w+Ito3WVV+miHnxhdyXLpKohzzNFUY9wO7ncK0ZuURkh+Lz0uggGJVZkQwgh+6pNYVioBWhVdPc9bK7XzVy9EME6IfOWnbvZ6ckJct76YXj94bx07qvPQtibljJexs0vebHiXCp9rJJNxedHhn2lTCKhszoczsPHwkoNI4Z7HJxOJhfrjqqKP3mcf3CTPvVxEKHF+fz4+qiunl6bQAZBq9HaBl1ADFcuMQk5anE5MFcvRKYP/MiFH2ghqK6e3s73Pj9HvxEMaSw2msneCc/firgzs9feRqi6+peS8/K1X0nKlhpyicXefz3C7UJTIuTCL0rh89IbfY8wehM9iBcAasb5AEAJOgFhFddo8XnnOCxM5qLPjwz72OnJCaqrp3fF7z+PkKpvhKrz0ysOh75ACKG5keH9ZFEY8pgIVQccOHJg6BsYlDLGGoF5/PLM7Rg26qYN24Y6P/xblM8L5qrTEaqq/K27XvczN8avCCnsyzO3Y7j/t3LD7lcvRHAtE9uug8PO3/05whcdEPotMNx2Gvq3egz9Wz1qoxVStHTpVyEjKZZ7roZKNhWf+8MvvMbNL3lxAQOhba079uwzbfmJF9clzs5/F8jGrwetKsPuuDRrXVPVBCDru6sOt2somjI63Dq9xWWwrvYKFWOxdW74kDI63OViNsYWEtESm40pPV/q7mWf0/XiTYSqhWrqcY/aiBK7QuhN9GDH2u2XyyUmwRYS0XKZjReSt0Jq6+sDQL3AXjJJeeZ2LHP2xCfGgW0eMVU5aYQq2VT8rn+Hu23XQb911+v+rpGzl5kb41eKN69GdSt7XHpOLXey5CqGzG/HZE4fDZo27/SaNmwbMm/Zudv22lsBsvALngIQW9CkcOnL8N3hH7txqdXO9z4/x603T63scVFdPb2lTCKRv/iXMEJV9brO6nBkLn0cFjouQgjlLv0lbN6yc7fO6nCYn3/Vh+9d6tMPArmLZ8K4kt7qo/+8yT0nvi/s9OSEUL46X013sXr6taCp9wHrhoaina4XYnyh3OT0N/sbZfxw3qZt18FhqW3Z6cmJ+ZFhn9q0BqOtx4dLmTbymrhQJqenvfu5cwghlJm99rbiRWYQQrZVmwRr0ovBFjMTqenLPqXTCpb2pwJW5/ojc7fObazHfD/dPRQly+wqYTb213Vq9Bs7//OngR/+8D88fxz50KP23ACA0EOvj6/v0VhstMbqoPmMLndFNKF+S2Ox0aYtO71c4Vw5k4gXxkYFS7Vyj8234hl39TG+77m12+Wslqbt7HYZNyxMAeNbEQ63SWp1M6n24WMZN2zzcKcrmJvj0eKNq1Glq63xrdBWD1rWoONOnO+7mev/p72eHjofhv6tHtveQwGhkTCX/Njo+fTpj4JqSv/R3UNRlklG03cv+9S0Uw1tKzeGjNZV3tnY31xq7yPf2udS1KIP0FJmVyPU/80EDDoAAI2kJQ26zmB302uejQgtYzrzr5NNazd3tR0p2OnJifTpj4K1licEHk3AoAMA0EhaTxSnoWjbyo0hsTXJm5lSlDl9NCglmMNQXT299IF3P3zi+P+bp98IhoSK/gMAAABAvWkZg66lzC5L+1MBp+uFmNT8ptmhTFFeC9rObpdBorAAH9Yde/atOBz6YtX/XIvTbwRDS5WXCAAAADweLJnKXWewu9tWDAQ1Wj2tVKBkaX9y2NL+5DBOaSqX2XjqztfeRrTTefhYWEz1LoXO6nBYd+zZp1/X75558wV3HZsGAAAAAA9YMoNeKmZjxdxsRG92eqTqdktRkFhxrRaKN69G1a7hi2HGRyOZsw+rMQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADx+/H/2u5LDS7qyZAAAAABJRU5ErkJggg==";
/* --- canonical fixed language (verbatim from reference letters) --- */
const LB={
 understand:"We understand this is an important decision and appreciate that you are considering our company. We are confident that AWM is the right choice for you and will be a great next step in your career.",
 lookForward:"We look forward to your acceptance of this offer and can't wait to have you join our team.",
 licenseTransfer:"Your official start date will be aligned with the transfer of your license to All Western Mortgage, and we will work with you to coordinate the timing.",
 managerBegin:"The position is set to begin on a mutually agreed-upon start date, and we look forward to working with you to finalize the details.",
 compIntroT:"To support your successful transition, we are pleased to extend the following compensation package:",
 compIntroS:"We are pleased to offer you the following compensation package:",
 ack:"I have read and understood this offer letter and hereby acknowledge, accept, and agree to the terms set forth above.",
 stdCommWYR:"A personalized commission plan tailored to support your business goals and client needs",
 stdCommHIW:"Commissions are paid on a bi-weekly basis. All pay is subject to applicable withholding and payroll taxes. Your compensation plan, including commission structure and override details, will be provided separately in your Loan Officer Compensation Plan Agreement.",
 perFileHIW:"Bonuses are paid in the last payroll of each month for all loans you processed that funded in the prior calendar month.",
 benefitsWYR:"Health, dental, vision, 401(k) match, paid time off",
 benefitsHIW:"Eligibility begins 1st of the month following start.",
 signonHIW:"If you voluntarily resign within twelve (12) months of your start date, or are terminated for cause, you agree to repay any sign-on bonuses, recruitment bonuses and/or guarantees paid to you by the company. Repayment must be made in full within thirty (30) days of your separation date.",
 prodHIW:"Paid as a one-time bonus in the payroll following verification that the production target has been met.",
 overrideHIW:"Override is paid on applicable production in accordance with your Loan Officer Compensation Plan Agreement.",
 accelHIW:"These accelerated basis-point rates apply during your initial ramp-up months and then revert to your standard Loan Officer Compensation Plan.",
 pnlHIW:"This credit is applied to your branch profit-and-loss statement for the period noted and is subject to the terms of your Loan Officer Compensation Plan Agreement."
};
const EXPECT_MANAGER=["Control over your local hiring, branch economics and overall growth strategy","Direct access to executive leadership — no layers to navigate","Built-in marketing, recruiting, and operational support","Priority rollout access to new tech, products, and initiatives"];
const EXPECT_OPS=["A collaborative, performance-driven work culture","Clear communication and direct access to leadership","Streamlined processes and strong team support","Recognition and rewards for efficiency and quality"];
const EXPECT_LICENSED=["A supportive and growth-focused environment","Access to cutting-edge tools and technology","A strong marketing and operations team to back your production","Transparent leadership with open communication at every level"];
const PATH={
 thrilled:"We're thrilled to welcome you to the All Western Mortgage team! If you're happy with the terms outlined above, please sign and return this letter to confirm your acceptance. If any questions come up in the meantime, don't hesitate to reach out—we're here to support you.",
 confirm:"We're excited to welcome you to All Western Mortgage! To confirm your acceptance of this offer, please sign and return this letter. If you have any questions in the meantime, don't hesitate to reach out—we're here to support you.",
 accept:"We're excited to have you join the All Western Mortgage team! To accept this offer, please sign and return this letter at your earliest convenience. Should you have any questions, feel free to reach out—we're here to help."
};
const CLOSING={
 welcome:"Once again, congratulations and welcome. We look forward to a successful partnership!",
 aboard:"Once again, congratulations and welcome aboard. We look forward to a successful partnership!",
 team:"Once again, congratulations and welcome to the team. We're looking forward to a successful partnership!"
};
const SIGNATORY={
 biaggi:{name:"Chris Biaggi",title:"CEO"},
 kauffman:{name:"Jeff Kauffman",title:"National Sales Manager"},
 kern:{name:"Ty Kern",title:"CSO"},
 lin:{name:"Peter Lin",title:"Senior VP of Strategy"}
};
const COMP_HL='color:#0B5CAB';

let L=null, curRec=null;
function todayISO(){const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');}
function longDate(iso){const M=["January","February","March","April","May","June","July","August","September","October","November","December"];if(!iso)return '';const m=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);return m?M[+m[2]-1]+' '+(+m[3])+', '+m[1]:iso;}
function splitAddr(s){s=(s||'').trim();if(!s)return [];if(s.indexOf('\n')>=0)return s.split('\n').map(x=>x.trim()).filter(Boolean);const i=s.indexOf(',');return i>=0?[s.slice(0,i).trim(),s.slice(i+1).trim()]:[s];}
function firstNameOf(d){const p=((d.preferredName||'').trim()||(d.employeeName||'').trim());return (p.split(/\s+/)[0])||'[First]';}
function article(t){return /^[aeiou]/i.test((t||'').trim())?'an':'a';}
function nl2br(s){return String(s).replace(/\n/g,'<br>');}
function moneyStr(s){const n=parseMoney(s);return n!=null?fmtMoney(n):((s||'').trim());}
function pnlWhenPhrase(m){m=(m||'').trim();if(!m)return"";return /^(in|on|at|as|by|during|your|the|after|before|once|when|upon|immediately|effective|beginning|starting|contingent|subject|following|per)\b/i.test(m)?" "+m:" in "+m;}
function pctStr(v){v=(v==null?'':String(v)).trim();return v===''?'N/A':v;}

function isCommissionedRec(d){const et=d.employmentType||'',pos=d.position||'';return /commission/i.test(et)||/loan officer|branch manager|area manager/i.test(pos);}
function defaultSignon(d){
 const m1=parseMoney(d.bonusSignOnAmount),m2=parseMoney(d.bonusSignOnMonth2),m3=parseMoney(d.bonusSignOnMonth3);
 const sched=[];if(m1!=null)sched.push(['Month 1',m1]);if(m2!=null)sched.push(['Month 2',m2]);if(m3!=null)sched.push(['Month 3',m3]);
 if(!sched.length)return "";
 const soTotal=sched.reduce((s,x)=>s+x[1],0);
 return (sched.length===1)
   ? fmtMoney(soTotal)+", eligible after your license becomes active under All Western Mortgage to help with the transition."
   : fmtMoney(soTotal)+" total, paid as "+sched.map(x=>x[0]+': '+fmtMoney(x[1])).join(', ')+", eligible after your license becomes active under All Western Mortgage to help with the transition.";}
function defaultPnl(d){
 const pairs=[['bonusPnlAmount','bonusPnlMonth'],['bonusPnlAmount2','bonusPnlMonth2'],['bonusPnlAmount3','bonusPnlMonth3']];
 const slots=[];
 pairs.forEach(function(p){var a=(d[p[0]]||'').trim();if(a)slots.push({amt:a,amtN:parseMoney(a),month:(d[p[1]]||'').trim()});});
 if(!slots.length)return "";
 const lic=isCommissionedRec(d)?", eligible 30 days after your license becomes active under All Western Mortgage to help with the transition":"";
 if(slots.length===1)return moneyStr(slots[0].amt)+" will be credited to P&L"+pnlWhenPhrase(slots[0].month)+lic+".";
 const allNum=slots.every(function(x){return x.amtN!=null;});
 const total=slots.reduce(function(s,x){return s+(x.amtN!=null?x.amtN:0);},0);
 const parts=slots.map(function(x){return moneyStr(x.amt)+pnlWhenPhrase(x.month);});
 const lead=allNum?fmtMoney(total)+" total, credited to P&L as: ":"Credited to P&L as: ";
 return lead+parts.join('; ')+lic+".";}
function guaranteeCalc(d){const monthly=parseMoney(d.bonusGuaranteeAmount);const months=parseInt(d.bonusGuaranteeMonths||'',10);if(monthly==null||!months||months<1)return null;return {perPeriod:monthly/2,periods:months*2,weeks:months*4,total:monthly*months,perS:fmtMoney(monthly/2),totalS:fmtMoney(monthly*months)};}
function defaultGuarantee(d){const c=guaranteeCalc(d);if(!c)return "";const lic=isCommissionedRec(d)?" after your license becomes active under All Western Mortgage to help with the transition.":".";return c.totalS+" total – paid as "+c.perS+" every two weeks for the first "+c.periods+" bi-weekly pay periods (~ "+c.weeks+" weeks)"+lic;}
function defaultPerfile(d){const dol=(d.bonusPerFileDollar||'').trim(),bps=(d.bonusPerFileBps||'').trim();if(dol)return moneyStr(dol)+" per closed/funded file assigned to you";if(bps)return "You will receive "+bps+" bps on the overall production generated by the branch for assigned files that are closed/funded.";return "";}
function defaultProduction(d){const amt=(d.bonusProductionAmount||'').trim(),vol=(d.bonusProductionVolume||'').trim(),mo=(d.bonusProductionMaxMonths||'').trim();if(!amt)return "";return moneyStr(amt)+" production bonus"+(vol?" upon reaching "+moneyStr(vol)+" in funded production":"")+(mo?" within the first "+mo+" months of onboarding":"")+".";}
function defaultOverride(d){const bps=(d.bonusOverrideBps||'').trim();return bps?bps+" bps override on managed production":"";}
function accelBpsStr(v){v=(v||'').trim();if(!v)return"";var n=Number(v.replace(/[^0-9.\-]/g,''));if(isNaN(n))return v;return n+" bps ("+(n/100).toFixed(2)+"%)";}
function defaultAccel(d){
 var pairs=[['bonusAccelBps1','Month 1'],['bonusAccelBps2','Month 2'],['bonusAccelBps3','Month 3']];
 var parts=[];
 pairs.forEach(function(p){var s=accelBpsStr(d[p[0]]);if(s)parts.push(p[1]+": "+s);});
 if(!parts.length)return "";
 return "Accelerated commission during your ramp-up period — "+parts.join('; ')+".";}
// Full Time / Part Time Operations default to non-exempt; other roles default to exempt.
// Manually overridable via the Exempt status toggle in the letter options.
function defaultExempt(d){return /operation/i.test((d&&d.employmentType)||'')?'non-exempt':'exempt';}

function defaultLetter(rec){const d=rec.data||{};const et=d.employmentType||'',pos=d.position||'';
 const commissioned=/commission/i.test(et)||/loan officer|branch manager|area manager/i.test(pos);
 const isMgr=/branch manager|area manager|non producing/i.test(pos)&&!/assistant/i.test(pos);
 const hasStart=!!(d.startDate&&d.startDate.trim());
 let opening=commissioned&&!hasStart?'licensed':(isMgr?'manager':(hasStart?'dated':'licensed'));
 const expectFamily=opening==='manager'?'manager':(opening==='licensed'?'licensed':'operations');
 const partTime=/part time/i.test(et);
 const anyComp=['compStandard','compBranch','compBuilder','compCorporate','compLeads','compBrokered'].some(k=>d[k]&&String(d[k]).trim());
 const bwStr=baseWageWYR(d);
 const baseOn=!!(bwStr&&!/commission only/i.test(bwStr)&&!/^\$?\s*0(\.0+)?(\s|$)/.test(bwStr.trim()));
 return {date:todayISO(),opening,expectFamily,
  compIntro:(opening==='manager'||opening==='licensed')?'transition':'simple',
  nmlsLine:expectFamily!=='operations',onboardingLine:false,
  pathAhead:opening==='manager'?'thrilled':(opening==='licensed'?'accept':'confirm'),
  closing:opening==='manager'?'welcome':(opening==='licensed'?'team':'aboard'),
  signatory:'kauffman',fullPart:partTime?'part-time':'full-time',exempt:defaultExempt(d),taxesClause:false,
  includeCommissionPlan:commissioned||anyComp,includeBrokered:!!(d.compBrokered&&String(d.compBrokered).trim()),
  watermark:{on:false,text:'SAMPLE'},
  rows:(function(){
   var t=function(v){return v&&String(v).trim();};   // custom-wording override helpers
   var baseTx=t(d.baseText),guarTx=t(d.guaranteeText),pfTx=t(d.perfileText),ovTx=t(d.overrideText);
   return {
   base:{on:!!(baseTx||baseOn),wyr:baseTx||(baseOn?bwStr:'')},
   signon:{on:!!((d.bonusSignOnAmount&&d.bonusSignOnAmount.trim())||(d.bonusSignOnMonth2&&d.bonusSignOnMonth2.trim())||(d.bonusSignOnMonth3&&d.bonusSignOnMonth3.trim())),wyr:defaultSignon(d)},
   pnl:(function(){var note=t(d.bonusPnlNote);var on=!!(t(d.bonusPnlAmount)||t(d.bonusPnlAmount2)||t(d.bonusPnlAmount3));return {on:on,wyr:defaultPnl(d),note:note||LB.pnlHIW};})(),
   guarantee:(function(){const gc=guaranteeCalc(d);return {on:!!(guarTx||(d.bonusGuaranteeAmount&&d.bonusGuaranteeAmount.trim())),amt:gc?gc.perS:'',periods:gc?String(gc.periods):'',style:'greater',custom:!!guarTx,wyr:guarTx||defaultGuarantee(d)};})(),
   perfile:{on:!!(pfTx||(d.bonusPerFileDollar&&d.bonusPerFileDollar.trim())||(d.bonusPerFileBps&&d.bonusPerFileBps.trim())),wyr:pfTx||defaultPerfile(d)},
   production:{on:!!(d.bonusProductionAmount&&d.bonusProductionAmount.trim()),wyr:defaultProduction(d)},
   override:{on:!!(ovTx||(d.bonusOverrideBps&&d.bonusOverrideBps.trim())),wyr:ovTx||defaultOverride(d)},
   accel:{on:!!(t(d.bonusAccelBps1)||t(d.bonusAccelBps2)||t(d.bonusAccelBps3)),wyr:defaultAccel(d)},
   stdCommission:{on:commissioned},
   benefits:{on:!partTime}
  };})()};}
function deepAssign(t,s){for(const k in s){if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k])){t[k]=t[k]||{};deepAssign(t[k],s[k]);}else t[k]=s[k];}return t;}
/* merge saved letter OPTIONS, but always re-derive comp rows from the current answers (true auto-pilot) */
function resolveLetter(rec){const base=defaultLetter(rec);if(rec.letter){deepAssign(base,rec.letter);base.rows=defaultLetter(rec).rows;}return base;}

function advanceHIW(amt){amt=esc(amt||'[amount]');return "Each "+amt+" payment is an advance on future commissions. Your commissions are still calculated every pay period. If your commissions exceed "+amt+" you keep the overage. If commissions are less than "+amt+", you still take home the full "+amt+" guarantee. Should you end your employment with the Company for any reason, or your employment relationship is ended by the Company for cause within the twelve (12) months of receiving a draw you will be responsible for returning any difference between the earned amount and the guaranteed amount, to the Company. By your signature on this employment agreement, you authorize the company to withhold this amount from any final pay you receive upon termination of employment. Any amount that you are required to repay the Company under this agreement is a debt due and owing to the Company, and you agree to pay in full within 30 days of the debt becoming due.";}
function greaterHIW(amt,periods){amt=esc(amt||'[amount]');periods=esc(periods||'[#]');return "For each of those "+periods+" pay periods you'll receive the greater of:<ul><li>The "+amt+" guarantee, or</li><li>Your earned commissions for that pay period.</li><li>If your commissions exceed "+amt+", you keep the overage. If they do not, you still take home the full "+amt+" guarantee.</li></ul>Should you end your employment with the Company for any reason, or your employment relationship is ended by the Company for cause within the twelve (12) months of receiving a draw you will be responsible for returning, any difference between the earned amount and the guaranteed amount, to the Company. By your signature on this employment agreement, you authorize the company to withhold this amount from any final pay you receive upon termination of employment. Any amount that you are required to repay the Company under this agreement is a debt due and owing to the Company, and you agree to pay in full within 30 days of the debt becoming due.";}

function has(v){return v&&String(v).trim()!=='';}
function compTableHTML(rec){const d=rec.data,R=L.rows,rows=[];
 if(has(R.base.wyr)){const hiw="Paid bi-weekly in accordance with All Western Mortgage's payroll schedule. "+(L.taxesClause?"All pay is subject to applicable withholding and payroll taxes. ":"")+"This position is classified as "+L.fullPart+" and "+L.exempt+".";rows.push(["Base Salary",nl2br(esc(R.base.wyr)),esc(hiw)]);}
 if(has(R.signon.wyr))rows.push(["Sign-On Bonus",nl2br(esc(R.signon.wyr)),esc(LB.signonHIW)]);
 if(R.pnl&&has(R.pnl.wyr))rows.push(["P&L Credit",nl2br(esc(R.pnl.wyr)),nl2br(esc(R.pnl.note||LB.pnlHIW))]);
 if(has(R.guarantee.wyr)){const hiw=R.guarantee.custom?esc("Paid in accordance with the terms above and your Loan Officer Compensation Plan Agreement."):(R.guarantee.style==='greater'?greaterHIW(R.guarantee.amt,R.guarantee.periods):advanceHIW(R.guarantee.amt));rows.push(["Guaranteed Pay",nl2br(esc(R.guarantee.wyr)),hiw]);}
 if(has(R.perfile.wyr))rows.push(["Per-File Bonus",nl2br(esc(R.perfile.wyr)),esc(LB.perFileHIW)]);
 if(R.production&&has(R.production.wyr))rows.push(["Production Bonus",nl2br(esc(R.production.wyr)),esc(LB.prodHIW)]);
 if(R.override&&has(R.override.wyr))rows.push(["Override",nl2br(esc(R.override.wyr)),esc(LB.overrideHIW)]);
 if(R.accel&&has(R.accel.wyr))rows.push(["Accelerated Commission",nl2br(esc(R.accel.wyr)),esc(LB.accelHIW)]);
 // Standard Commission only when the person actually has standard commission % entered (Q28–34).
 // Overrides / per-file / production each have their own row and do NOT trigger Standard Commission.
 const stdComp=['compStandard','compBranch','compBuilder','compCorporate','compLeads','compBrokered'].some(k=>has(d[k]));
 if(isCommissionedRec(d)&&stdComp)rows.push(["Standard Commission",esc(LB.stdCommWYR),esc(LB.stdCommHIW)]);
 if(!/part time/i.test(d.employmentType||''))rows.push(["Benefits Package",esc(LB.benefitsWYR),esc(LB.benefitsHIW)]);
 return '<table class="comp-table"><thead><tr><th>Component</th><th>What You Receive</th><th>How It Works</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+r[0]+'</td><td style="'+COMP_HL+'">'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('')+'</tbody></table>';}

function expectHTML(title){const art=article(title);let head,bullets;
 if(L.expectFamily==='manager'){head="At All Western, "+esc(title)+"s are empowered. You'll have:";bullets=EXPECT_MANAGER;}
 else{head="As "+art+" "+esc(title)+" at All Western, you'll benefit from:";bullets=(L.expectFamily==='licensed')?EXPECT_LICENSED:EXPECT_OPS;}
 return '<h3 class="sec">What You Can Expect</h3><p>'+head+'</p><ul>'+bullets.map(b=>'<li>'+esc(b)+'</li>').join('')+'</ul>';}
function nextStepsHTML(){let it=["Completion of a background check"];if(L.nmlsLine)it.push("Your NMLS license being transferred to All Western Mortgage");if(L.onboardingLine)it.push("Submission of onboarding documentation and any required verifications");it.push("Signing all required employee agreements and policy documents prior to receiving access to company systems");return '<h3 class="sec">Next Steps</h3><p>This offer is contingent on:</p><ul>'+it.map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul>';}
function cpPct(v){v=(v==null?'':String(v)).trim();if(v===''||/^n\/?a$/i.test(v))return 'N/A';const n=Number(v.replace(/[^0-9.\-]/g,''));if(isNaN(n))return esc(v);return (n/100).toFixed(2)+' %';}   // bps -> percent
function cpLine(v,label,def){return '<p class="cp-line"><span class="cp-pct" style="'+COMP_HL+'">'+cpPct(v)+'</span> '+esc(label)+': '+esc(def)+'</p>';}
function commissionPlanHTML(d){const mxRaw=(d.compMaximum||'').trim();const mx=(mxRaw===''||/^n\/?a$/i.test(mxRaw))?'N/A':(parseMoney(mxRaw)!=null?fmtMoney(parseMoney(mxRaw)):esc(mxRaw));
 const mnRaw=(d.compMinimum||'').trim();const mn=(mnRaw===''||/^n\/?a$/i.test(mnRaw))?'N/A':(parseMoney(mnRaw)!=null?fmtMoney(parseMoney(mnRaw)):esc(mnRaw));
 let h='<h3 class="sec">1. Compensation Plan for AWM Funded Loans:</h3>';
 h+='<p>I select the following percentages of loan amounts as my Compensation Plan based on the categories listed below. Compensation Plan is Effective as of the date below.</p><div class="comp-plan">';
 h+=cpLine(d.compStandard,'Self-generated','Defined as loans initiated and procured by the Loan Officer independently.');
 h+=cpLine(d.compBranch,'Branch Marketing','Defined as transactions derived from a branch office supplied marketing effort or branch office provided lead source.');
 h+=cpLine(d.compBuilder,'Builder Marketing','Defined as transactions derived from a preferred builder relationship provided by branch.');
 h+=cpLine(d.compCorporate,'Corporate Marketing','Defined as transactions derived from corporate supplied marketing efforts or corporate provided lead source.');
 h+=cpLine(d.compLeads,'Leads','Defined as transactions derived from leads generation systems.');
 h+='<p class="cp-line"><span class="cp-pct" style="'+COMP_HL+'">'+mn+'</span> Minimum: Minimum compensation by dollar amount on all loans (optional, to set no minimum compensation level list N/A).</p>';
 h+='<p class="cp-line"><span class="cp-pct" style="'+COMP_HL+'">'+mx+'</span> Maximum: Max compensation by dollar amount allowed on all loans (optional, to set no maximum compensation level list N/A).</p></div>';
 if(has(d.compBrokered)){h+='<p>2. I select the following percentages of loan amounts as my Compensation Plan based on the categories listed below. Compensation Plan is effective as of the date below.</p>';h+='<div class="comp-plan"><p class="cp-line"><span class="cp-pct" style="'+COMP_HL+'">'+cpPct(d.compBrokered)+'</span> for Brokered Transactions</p></div>';}
 return h;}

function generateLetterHTML(rec){const d=rec.data,title=d.position||'[Position]',first=firstNameOf(d),name=d.employeeName||'[Employee Name]',addr=splitAddr(d.fullAddress),startLong=longDate(d.startDate);
 let openP;
 if(L.opening==='manager')openP='<p>We are excited to offer you the position of '+'<strong>'+esc(title)+'</strong>'+" at All Western Mortgage. Your leadership and experience will be a strong addition to our team, and we know you'll make a meaningful impact in this role.</p><p>"+esc(LB.managerBegin)+'</p>';
 else if(L.opening==='dated')openP='<p>We are excited to offer you the position of '+'<strong>'+esc(title)+'</strong>'+' at All Western Mortgage, beginning '+esc(startLong||'[start date]')+'.</p>';
 else openP='<p>We are excited to offer you the position of '+'<strong>'+esc(title)+'</strong>'+' at All Western Mortgage.</p>';
 let h='';
 h+='<img class="logo" src="'+AWM_LOGO+'" alt="All Western Mortgage">';
 h+='<div class="date-line">'+esc(longDate(L.date))+'</div>';
 h+='<div class="addr" style="margin-bottom:22px"><div><strong>'+esc(name)+'</strong></div>'+addr.map(a=>'<div>'+esc(a)+'</div>').join('')+'</div>';
 h+='<p>Dear '+esc(first)+',</p>';
 h+=openP;
 h+='<p>'+esc(LB.understand)+'</p>';
 if(L.opening==='licensed')h+='<p>'+esc(LB.licenseTransfer)+'</p>';
 h+='<p>'+esc(LB.lookForward)+'</p>';
 h+='<h3 class="sec">Compensation</h3>';
 h+='<p>'+esc(L.compIntro==='transition'?LB.compIntroT:LB.compIntroS)+'</p>';
 h+=compTableHTML(rec);
 h+=expectHTML(title);
 h+=nextStepsHTML();
 h+='<h3 class="sec">The Path Ahead</h3><p>'+esc(PATH[L.pathAhead])+'</p>';
 const anyComp=['compStandard','compBranch','compBuilder','compCorporate','compLeads','compMinimum','compMaximum','compBrokered'].some(k=>has(d[k]));
 if(anyComp)h+=commissionPlanHTML(d);
 h+='<p>'+esc(CLOSING[L.closing])+'</p>';
 const sg=SIGNATORY[L.signatory]||SIGNATORY.kauffman;
 h+='<div class="sig-block"><p>Warm regards,</p><table style="width:60%;margin-top:48px;border-collapse:collapse"><tr><td style="border-top:1px solid #111;padding-top:3px"><strong>'+esc(sg.name)+'</strong><br>'+esc(sg.title)+'</td></tr></table></div>';
 h+='<p class="ack">'+esc(LB.ack)+'</p>';
 h+='<table style="width:72%;margin-top:34px;border-collapse:collapse"><tr>'
   +'<td style="border-top:1px solid #111;padding-top:3px"><strong>'+esc(name)+'</strong></td><td style="width:50px"></td>'
   +'<td style="border-top:1px solid #111;padding-top:3px;width:2in">Date</td></tr></table>';
 return h;}

/* --- options panel --- */
function selOpt(path,label,opts,cur){return '<div class="lo-row"><label>'+label+'</label><select data-opt="'+path+'">'+opts.map(o=>'<option value="'+o[0]+'"'+(o[0]===cur?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>';}
function chkOpt(path,label,checked){return '<label class="lo-check"><input type="checkbox" data-opt="'+path+'"'+(checked?' checked':'')+'> '+label+'</label>';}
function txtOpt(path,label,val){return '<div class="lo-row"><label>'+label+'</label><textarea data-opt="'+path+'" rows="2" style="padding:7px 9px;border:1px solid var(--line);border-radius:6px;font-size:12.5px;font-family:inherit;resize:vertical">'+esc(val||'')+'</textarea></div>';}
function inpOpt(path,label,val,type){return '<div class="lo-row"><label>'+label+'</label><input type="'+(type||'text')+'" data-opt="'+path+'" value="'+esc(val||'')+'"></div>';}
function renderOptions(L){let h='';
 h+='<h4>Letter</h4>';
 h+=inpOpt('date','Letter date',L.date,'date');
 h+=selOpt('opening','Opening style',[['manager','Manager (leadership / agreed start)'],['dated','Dated start (“beginning …”)'],['licensed','Licensed (license transfer)']],L.opening);
 h+=selOpt('compIntro','Compensation intro',[['transition','To support your successful transition…'],['simple','We are pleased to offer…']],L.compIntro);
 h+=selOpt('expectFamily','What You Can Expect',[['manager','Manager – empowered'],['operations','Operations – benefit from'],['licensed','Licensed – supportive/growth']],L.expectFamily);
 h+='<h4>Classification (Base Salary)</h4>';
 h+=selOpt('fullPart','Full/Part time',[['full-time','full-time'],['part-time','part-time']],L.fullPart);
 h+=selOpt('exempt','Exempt status',[['non-exempt','non-exempt'],['exempt','exempt']],L.exempt);
 h+=chkOpt('taxesClause','Include “all pay subject to withholding…” line',L.taxesClause);
 h+='<h4>Sections</h4>';
 h+=chkOpt('nmlsLine','Next Steps: NMLS transfer line',L.nmlsLine);
 h+=chkOpt('onboardingLine','Next Steps: onboarding docs line',L.onboardingLine);
 h+=selOpt('pathAhead','The Path Ahead',[['thrilled','Thrilled / if you’re happy'],['confirm','Excited / to confirm'],['accept','Excited / to accept']],L.pathAhead);
 h+=selOpt('closing','Closing line',[['welcome','…welcome.'],['aboard','…welcome aboard.'],['team','…welcome to the team.']],L.closing);
 h+=selOpt('signatory','Signatory',[['biaggi','Chris Biaggi – CEO'],['kauffman','Jeff Kauffman – National Sales Manager'],['kern','Ty Kern – CSO'],['lin','Peter Lin – Senior VP of Strategy']],L.signatory);
 h+='<h4>Compensation table (auto-included)</h4>';
 h+='<p style="font-size:11.5px;color:var(--muted);margin:0 0 8px">Every component with a value is included automatically — salary, sign-on, guarantee, per-file, production, override. Edit the wording below; clear a box to drop that row.</p>';
 h+=txtOpt('rows.base.wyr','Base Salary',L.rows.base.wyr);
 h+=txtOpt('rows.signon.wyr','Sign-On Bonus',L.rows.signon.wyr);
 h+=selOpt('rows.guarantee.style','Guarantee wording',[['advance','Advance on commissions'],['greater','Greater-of (bulleted)']],L.rows.guarantee.style);
 h+=inpOpt('rows.guarantee.amt','Guarantee – per pay-period amount',L.rows.guarantee.amt);
 h+=inpOpt('rows.guarantee.periods','Guarantee – # pay periods',L.rows.guarantee.periods);
 h+=txtOpt('rows.guarantee.wyr','Guaranteed Pay',L.rows.guarantee.wyr);
 h+=txtOpt('rows.perfile.wyr','Per-File Bonus',L.rows.perfile.wyr);
 h+=txtOpt('rows.production.wyr','Production Bonus',L.rows.production.wyr);
 h+=txtOpt('rows.override.wyr','Override',L.rows.override.wyr);
 h+='<p style="font-size:11.5px;color:var(--muted);margin-top:6px">Standard Commission and Benefits are added automatically for commissioned / non-part-time roles. The AWM commission-plan % section appears whenever any Q28–34 percentages are filled. You can also click into the letter to fine-tune wording.</p>';
 return h;}
function setByPath(o,path,val){const p=path.split('.');let t=o;for(let i=0;i<p.length-1;i++)t=t[p[i]];t[p[p.length-1]]=val;}

const LETTER_FOOT='All Western Mortgage, Inc. &nbsp;&bull;&nbsp; 8345 W. Sunset Rd. #380<br>Las Vegas, NV 89113 &nbsp;&bull;&nbsp; Main 702.369.0905 &nbsp;&bull;&nbsp; Fax 702.920.8421';
let letterRegenTimer=null;
function letterWrap(body){return '<table class="letter-table"><tfoot><tr><td><div class="lp-foot">'+LETTER_FOOT+'</div></td></tr></tfoot><tbody><tr><td>'+body+'</td></tr></tbody></table>';}
// A hand-edited letter stays valid until the user actually edits a NEW-HIRE FIELD (which sets
// letterStale=true). Incidental data round-trips (dollar reformatting, etc.) never discard the edit.
function letterEditIsCurrent(rec){return !!(rec&&rec.letterHtml&&!rec.letterStale);}
// Body used for exports: the saved hand-edited body ONLY if the fields haven't changed since; else freshly generated.
function letterInnerFor(rec){
  if(letterEditIsCurrent(rec)){try{var d=document.createElement('div');d.innerHTML=rec.letterHtml;var td=d.querySelector('table.letter-table tbody td')||d.querySelector('tbody td');if(td)return td.innerHTML;}catch(e){}return rec.letterHtml;}
  return generateLetterHTML(rec);
}
function updateLetterEditStatus(state){
  var el=document.getElementById('letterEditStatus');if(!el)return;
  var edited=!!(curRec&&curRec.letterHtml);
  if(state==='saving'){el.textContent='Saving…';el.style.color='#ffe6b3';return;}
  if(edited){el.textContent=(state==='saved'?'✓ Edits saved':'✎ Hand-edited');el.style.color='#bff0dd';}
  else{el.textContent='';}
}
// regen = rebuild from fields/options (AUTO mode) — discards any manual edits.
function regen(){if(!L||!curRec)return;curRec.letterHtml=null;curRec.letterStale=false;
 document.getElementById('letterContent').innerHTML=letterWrap(generateLetterHTML(curRec));curRec.letter=L;persist();setTimeout(renderWatermark,0);updateLetterEditStatus();}
function loadEditedLetter(){document.getElementById('letterContent').innerHTML=curRec.letterHtml;setTimeout(renderWatermark,0);updateLetterEditStatus('saved');}
function renderWatermark(){const wl=document.getElementById('wmLayer');if(!L||!L.watermark.on){wl.className='watermark-layer';wl.innerHTML='';return;}wl.className='watermark-layer on';const sheet=document.getElementById('letterSheet');const hgt=sheet.scrollHeight||1100;const rows=Math.ceil(hgt/120)+2;const n=rows*6;const t=esc(L.watermark.text||'SAMPLE');wl.innerHTML='<div class="wm-inner">'+Array(n).fill('<span>'+t+'</span>').join('')+'</div>';}
function currentLetterRecord(){if(typeof commitCurrent==='function')commitCurrent(true);if(!currentId)return null;return records.find(r=>r.id===currentId)||null;}
function openLetter(){const rec=currentLetterRecord();if(!rec){toast('Add the new hire details first, then generate the letter.',true);return;}curRec=rec;L=resolveLetter(rec);
 document.getElementById('letterName').textContent=rec.data.employeeName||'New hire';
 document.getElementById('letterOptions').innerHTML=renderOptions(L);
 var wm=document.getElementById('letterWmOn');if(wm)wm.checked=!!(L.watermark&&L.watermark.on);
 if(letterEditIsCurrent(rec)){loadEditedLetter();}          // keep hand-edits only if the fields are unchanged
 else{var wasEdited=!!rec.letterHtml;regen();if(wasEdited)toast('Details changed since your edits — letter rebuilt from the current fields.');}
 showSub('letter');}
function closeLetter(){showView('pipeline');}

/* ---- self-contained shareable export (current record + its offer letter) ---- */
function shareSummaryHTML(rec){const d=rec.data;let h='';
 GROUPS.forEach(g=>{const fs=DATA_FIELDS.filter(f=>f.g===g.n&&d[f.id]&&String(d[f.id]).trim());if(!fs.length)return;
  h+='<div class="sgrp"><h3>'+esc(g.title)+'</h3><table class="stab">';
  fs.forEach(f=>{h+='<tr><td class="k">'+esc(f.label)+'</td><td class="v">'+esc(String(d[f.id])).replace(/\n/g,'<br>')+'</td></tr>';});
  h+='</table></div>';});
 return h||'<p>No details entered yet.</p>';}
function buildLetterStandaloneHTML(rec){const saveL=L,saveRec=curRec;
 curRec=rec;L=resolveLetter(rec);
 const body=letterInnerFor(rec);
 L=saveL;curRec=saveRec;
 return '<table class="letter-table"><tfoot><tr><td><div class="lp-foot">'+LETTER_FOOT+'</div></td></tr></tfoot><tbody><tr><td>'+body+'</td></tr></tbody></table>';}
function exportShareHTML(){const rec=currentLetterRecord();if(!rec){toast('Add the new hire details first, then share.',true);return;}
 const name=rec.data.employeeName||'New Hire';
 const letterHTML=buildLetterStandaloneHTML(rec);
 const summaryHTML=shareSummaryHTML(rec);
 const css="*{box-sizing:border-box}body{margin:0;background:#5b6675;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111}"
 +".ctrl{position:sticky;top:0;z-index:10;background:#1b2a4a;color:#fff;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 16px}"
 +".ctrl strong{font-size:15px}.ctrl .sp{flex:1}.ctrl label{display:flex;align-items:center;gap:6px;font-size:13px;background:rgba(255,255,255,.12);padding:5px 10px;border-radius:7px}"
 +".ctrl select{padding:6px 8px;border-radius:6px;border:1px solid #2a3a5c}.ctrl button{cursor:pointer;border:none;border-radius:7px;padding:8px 14px;font-weight:600;background:#2f5fd0;color:#fff;font-size:13px}"
 +".sheet{position:relative;background:#fff;width:8.5in;min-height:11in;margin:26px auto;box-shadow:0 6px 30px rgba(0,0,0,.35);padding:.6in .75in .7in}"
 +".letter-content{font-family:Calibri,Segoe UI,Arial,sans-serif;font-size:11pt;line-height:1.42;position:relative;z-index:2}"
 +".letter-table{width:100%;border-collapse:collapse}.letter-table>tbody>tr>td,.letter-table>tfoot>tr>td{padding:0;border:none}"
 +".lp-foot{text-align:center;font-size:8.5pt;color:#333;line-height:1.35;padding-top:16px}"
 +".letter-content .logo{width:2.5in;margin:0 0 18px}.letter-content .date-line{text-align:right;margin-bottom:14px}"
 +".letter-content p{margin:0 0 9px}.letter-content .addr div{line-height:1.35}.letter-content h3.sec{font-size:12.5pt;font-weight:700;margin:16px 0 8px}"
 +".letter-content ul{margin:0 0 9px;padding-left:22px}.letter-content ul li{margin-bottom:4px}"
 +".comp-table{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:10pt}.comp-table th,.comp-table td{border:1px solid #b9c2d0;padding:7px 9px;vertical-align:top;text-align:left}"
 +".comp-table th{background:#eef2f9;font-weight:700}.comp-table td:first-child{font-weight:700;width:20%}.comp-table td:nth-child(2){width:34%}"
 +".comp-plan .cp-line{margin:0 0 9px}.cp-pct{font-weight:700}.sig-name{margin-top:2px}.letter-content .ack{margin-top:26px}"
 +".wm{position:absolute;inset:0;overflow:hidden;z-index:1;pointer-events:none;display:none}.wm.on{display:block}"
 +".wmi{position:absolute;top:-25%;left:-25%;width:150%;height:150%;display:flex;flex-wrap:wrap;gap:70px 46px;transform:rotate(-30deg)}"
 +".wmi span{color:rgba(200,30,30,.12);font-size:46px;font-weight:800;letter-spacing:5px;white-space:nowrap;font-family:Arial}"
 +".summary{max-width:8.5in;margin:0 auto 40px;background:#fff;border-radius:12px;padding:20px 26px;box-shadow:0 6px 30px rgba(0,0,0,.25)}"
 +".summary h2{margin:0 0 12px;color:#1b2a4a}.sgrp h3{margin:16px 0 6px;color:#1b2a4a;font-size:14px;border-bottom:1px solid #e2e7ef;padding-bottom:4px}"
 +".stab{width:100%;border-collapse:collapse;font-size:13px}.stab td{padding:5px 8px;border-bottom:1px solid #f0f2f6;vertical-align:top}.stab .k{width:38%;color:#516079;font-weight:600}"
 +"@media print{.ctrl,.summary{display:none!important}body{background:#fff}.sheet{box-shadow:none;margin:0;width:auto;min-height:0;padding:0}@page{size:letter;margin:.55in .7in .55in}}";
 const js="var WM={on:false,text:'SAMPLE'};function rwm(){var wl=document.getElementById('wmLayer');if(!WM.on){wl.className='wm';wl.innerHTML='';return;}wl.className='wm on';var h=(document.querySelector('.sheet').scrollHeight)||1100;var n=(Math.ceil(h/120)+2)*6;var s='';for(var i=0;i<n;i++){s+='<span>'+WM.text+'</span>';}wl.innerHTML='<div class=\"wmi\">'+s+'</div>';}document.getElementById('wmOn').onchange=function(){WM.on=this.checked;rwm();};document.getElementById('wmSel').onchange=function(){WM.text=this.value;rwm();};";
 const doc='<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offer Packet — '+esc(name)+'</title><style>'+css+'</style></head><body>'
 +'<div class="ctrl"><strong>Offer Packet — '+esc(name)+'</strong><span class="sp"></span>'
 +'<label><input type="checkbox" id="wmOn"> Watermark</label>'
 +'<select id="wmSel"><option>SAMPLE</option><option>PROOF</option><option>DRAFT</option><option>COPY</option><option>CONFIDENTIAL</option></select>'
 +'<button onclick="window.print()">Print / Save as PDF</button></div>'
 +'<div class="sheet"><div class="wm" id="wmLayer"></div><div class="letter-content">'+letterHTML+'</div></div>'
 +'<div class="summary"><h2>Request Details</h2>'+summaryHTML+'</div>'
 +'<script>'+js+'<\/script></body></html>';
 const safe=(name.replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'')||'record');
 downloadBlob(new Blob([doc],{type:'text/html'}),'Offer_Packet_'+safe+'.html');
 toast('Shareable offer packet exported.');}

document.getElementById('btnShare').addEventListener('click',exportShareHTML);
document.getElementById('letterShare').addEventListener('click',exportShareHTML);
document.getElementById('letterEmail').addEventListener('click',function(){emailViaOutlook();});

/* ---- export the current offer letter as an editable Word document ---- */
// Build the full Word (.doc) HTML for one record. wm={on,text} adds a light SAMPLE watermark.
function letterDocHTML(rec,wm){
 const name=rec.data.employeeName||'New Hire';
 const saveL=L,saveRec=curRec;curRec=rec;L=resolveLetter(rec);
 const body=letterInnerFor(rec);L=saveL;curRec=saveRec;
 const wmHtml=(wm&&wm.on)?"<div style='position:absolute;top:36%;left:0;width:100%;text-align:center;transform:rotate(-30deg);color:#d81f2a;opacity:0.12;font-size:96pt;font-weight:bold;z-index:0'>"+esc(wm.text||'SAMPLE')+"</div>":"";
 const letterHTML=body+"<div class='lp-foot'>"+LETTER_FOOT+"</div>";
 const css="@page{size:8.5in 11.0in;margin:0.7in 0.75in 0.7in 0.75in}"
  +"body{font-family:Calibri,Arial,sans-serif;font-size:11.0pt;color:#111111}"
  +"p{margin:0 0 8pt 0}"
  +"img.logo{width:2.4in;height:auto}"
  +".date-line{text-align:right;margin-bottom:10pt}"
  +".addr div{line-height:1.2}"
  +"h3.sec{font-size:12.5pt;font-weight:bold;margin:12pt 0 6pt 0}"
  +"ul{margin:0 0 8pt 0}"
  +"table.comp-table{border-collapse:collapse;width:100%;margin:6pt 0 10pt 0;font-size:10.0pt}"
  +"table.comp-table td,table.comp-table th{border:1px solid #b9c2d0;padding:6pt;vertical-align:top;text-align:left}"
  +"table.comp-table th{background:#eef2f9;font-weight:bold}"
  +"table.comp-table td:first-child{font-weight:bold}"
  +".cp-pct{font-weight:bold}"
  +".ack{margin-top:20pt}"
  +".lp-foot{text-align:center;font-size:8.5pt;color:#333333;margin-top:14pt}"
  +"table.letter-table{width:100%;border-collapse:collapse}table.letter-table>tbody>tr>td,table.letter-table>tfoot>tr>td{border:none;padding:0}";
 const doc="<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>"
  +"<head><meta charset='utf-8'><title>Offer Letter - "+esc(name)+"</title>"
  +"<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->"
  +"<style>"+css+"</style></head><body>"+wmHtml+"<div class='letter-content' style='position:relative;z-index:1'>"+letterHTML+"</div></body></html>";
 return {name:name,doc:doc};
}
function exportLetterDoc(){const rec=currentLetterRecord();if(!rec){toast('Add the new hire details first, then export.',true);return;}
 const o=letterDocHTML(rec,null);
 const safe=(o.name.replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'')||'letter');
 downloadBlob(new Blob(['﻿'+o.doc],{type:'application/msword'}),'Offer_Letter_'+safe+'.doc');
 toast('Word document exported. Open in Word to edit, then Save As .docx.');}
document.getElementById('letterDoc').addEventListener('click',exportLetterDoc);
// Mass Word export: a zip of individual .doc files, one per selected candidate (respects the Watermark toggle).
function exportMassLettersWord(ids){if(!ids.length){toast('Select at least one candidate.',true);return;}
 const wm={on:!!(document.getElementById('massWmOn')&&document.getElementById('massWmOn').checked),text:'SAMPLE'};
 const enc=new TextEncoder();const used={};const files=[];
 for(let i=0;i<ids.length;i++){const r=records.find(x=>x.id===ids[i]);if(!r)continue;
   try{const o=letterDocHTML(r,wm);let base=((o.name||'New Hire').replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'')||'letter');if(used[base]){used[base]++;base=base+'_'+used[base];}else used[base]=1;
     files.push({name:'Offer_Letter_'+base+'.doc',bytes:enc.encode('﻿'+o.doc)});}catch(e){}
 }
 if(!files.length){toast('Could not generate Word docs.',true);return;}
 downloadBlob(new Blob([makeZip(files)],{type:'application/zip'}),'Offer_Letters_Word_'+dstamp()+'.zip');
 toast('Generated a zip with '+files.length+' Word doc'+(files.length!==1?'s':'')+(wm.on?' (watermarked)':'')+'.');}

/* ---- export a full self-contained copy of the app WITH all records baked in ---- */
function exportAppWithData(){
  if(typeof dirty!=='undefined'&&dirty)commitCurrent(true);
  // temporarily clear transient/generated DOM so the exported source stays clean & small
  const lc=document.getElementById('letterContent'),lo=document.getElementById('letterOptions'),wm=document.getElementById('wmLayer');
  const ov=document.getElementById('letterOverlay'),wasOpen=ov.classList.contains('show');
  const s1=lc?lc.innerHTML:'',s2=lo?lo.innerHTML:'',s3=wm?wm.innerHTML:'';
  if(lc)lc.innerHTML='';if(lo)lo.innerHTML='';if(wm)wm.innerHTML='';
  ov.classList.remove('show');document.body.classList.remove('letter-open');
  let html='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
  // restore live DOM
  if(lc)lc.innerHTML=s1;if(lo)lo.innerHTML=s2;if(wm)wm.innerHTML=s3;
  if(wasOpen){ov.classList.add('show');document.body.classList.add('letter-open');}
  const SEEDVAR='__SEED_RECORDS__';
  const marker='var '+SEEDVAR+'=null;';
  let seed=JSON.stringify(records).replace(/[<\u2028\u2029]/g,function(c){return '\\u'+('000'+c.charCodeAt(0).toString(16)).slice(-4);});
  if(html.indexOf(marker)<0){toast('Export marker not found.',true);return;}
  html=html.replace(marker,'var '+SEEDVAR+'='+seed+';');
  downloadBlob(new Blob([html],{type:'text/html'}),'Offer_New_Hire_App_'+dstamp()+'.html');
  toast('Exported app copy with '+records.length+' record'+(records.length!==1?'s':'')+'.');
}
document.getElementById('btnExportApp').addEventListener('click',exportAppWithData);

/* ---- Export / Backup dropdown menu ---- */
(function(){const btn=document.getElementById('menuExportBtn'),menu=document.getElementById('exportMenu');
 btn.addEventListener('click',function(e){e.stopPropagation();menu.classList.toggle('open');});
 menu.addEventListener('click',function(e){if(e.target.closest('button'))menu.classList.remove('open');});
 document.addEventListener('click',function(e){if(!e.target.closest('.dropdown'))menu.classList.remove('open');});
})();
document.getElementById('btnLetter').addEventListener('click',openLetter);
document.getElementById('letterClose').addEventListener('click',closeLetter);
document.getElementById('letterRegen').addEventListener('click',()=>{
  if(letterEditIsCurrent(curRec)){confirmModal('Regenerate?','Discard your manual edits and rebuild this letter from the current fields?',function(){regen();toast('Letter rebuilt from the current fields.');});}
  else{regen();toast('Letter regenerated from the current fields.');}
});
// Watermark toggle for this letter (shows on screen and in Print / Save as PDF). Independent of edits.
document.getElementById('letterWmOn').addEventListener('change',function(){
  if(!L||!curRec)return;L.watermark=L.watermark||{on:false,text:'SAMPLE'};L.watermark.on=this.checked;curRec.letter=L;persist();renderWatermark();
});
document.getElementById('letterPrint').addEventListener('click',function(){document.body.classList.add('printing-letter');window.print();setTimeout(function(){document.body.classList.remove('printing-letter');},700);});
// Save manual edits to the letter body (debounced) so they persist and flow into exports.
let _letterEditTimer=null;
document.getElementById('letterContent').addEventListener('input',function(){
  if(!curRec)return;
  updateLetterEditStatus('saving');
  clearTimeout(_letterEditTimer);
  _letterEditTimer=setTimeout(function(){
    curRec.letterHtml=document.getElementById('letterContent').innerHTML;curRec.letterStale=false;curRec.letter=L;persist();updateLetterEditStatus('saved');
  },500);
});
document.getElementById('letterOptions').addEventListener('input',function(e){const el=e.target;const path=el.dataset.opt;if(!path)return;const val=el.type==='checkbox'?el.checked:el.value;
  const apply=function(){setByPath(L,path,val);curRec.letter=L;curRec.letterHtml=null;persist();clearTimeout(letterRegenTimer);letterRegenTimer=setTimeout(regen,el.tagName==='TEXTAREA'||el.type==='text'||el.type==='date'?350:0);};
  if(curRec&&curRec.letterHtml){confirmModal('Discard manual edits?','This letter has manual edits. Changing this option rebuilds it and discards those edits. Continue?',apply,function(){document.getElementById('letterOptions').innerHTML=renderOptions(L);});}
  else apply();
});
</script>

<script>
/* ===================== PIPELINE / HIRED / ARCHIVED / ANALYSIS ===================== */
let currentView='pipeline';
function stageOf(r){return r.stage||'pipeline';}
function setStage(id,stage){const r=records.find(x=>x.id===id);if(!r)return;r.stage=stage;persist();renderStageTables();const lbl=stage==='pipeline'?'Pipeline':(stage==='hired'?'Hired':'Archived');toast('Moved to '+lbl+'.');}
function offerDateISO(r){return (r.letter&&r.letter.date)||((r.created||'').slice(0,10))||'';}
function monthKeyOf(r){const m=String(offerDateISO(r)).match(/^(\d{4})-(\d{2})/);return m?m[1]+'-'+m[2]:'';}
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtShort(iso){const m=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);return m?MON[+m[2]-1]+' '+(+m[3])+', '+m[1]:'—';}
function fmtMonthKey(k){if(!k)return 'No date';const p=k.split('-');return MON[+p[1]-1]+' '+p[0];}
function stageFilter(stage){const g=k=>{const el=document.querySelector('.'+k+'[data-stage="'+stage+'"]');return el?el.value:'';};return {nm:g('f-name').toLowerCase().trim(),br:g('f-branch'),ti:g('f-title')};}
function stageHasFilter(stage){const f=stageFilter(stage);return !!(f.nm||f.br||f.ti);}
function stageRows(stage){const f=stageFilter(stage);return records.filter(r=>stageOf(r)===stage).filter(function(r){const d=r.data;
  if(f.nm && !((d.employeeName||d.preferredName||'').toLowerCase().indexOf(f.nm)>=0))return false;
  if(f.br && (d.branchName||'')!==f.br)return false;
  if(f.ti && (d.position||'')!==f.ti)return false;
  return true;});}
function distinctVals(stage,key){const set={};records.filter(r=>stageOf(r)===stage).forEach(function(r){const v=(r.data[key]||'').trim();if(v)set[v]=1;});return Object.keys(set).sort();}
function fillFilterSelects(stage){
  const bs=document.querySelector('.f-branch[data-stage="'+stage+'"]');
  const ts=document.querySelector('.f-title[data-stage="'+stage+'"]');
  if(bs){const cur=bs.value;bs.innerHTML='<option value="">All branches</option>'+distinctVals(stage,'branchName').map(v=>'<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(v)+'</option>').join('');}
  if(ts){const cur=ts.value;ts.innerHTML='<option value="">All titles</option>'+distinctVals(stage,'position').map(v=>'<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(v)+'</option>').join('');}
}
function stageActions(stage,id){
 const edit='<button class="mini" data-act="edit" data-id="'+id+'" title="Edit new-hire details">Edit</button>';
 const letter='<button class="mini" data-act="letter" data-id="'+id+'" title="Open the offer letter">Letter</button>';
 const xls='<button class="mini" data-act="excel" data-id="'+id+'" title="Export this person\'s details to Excel (.xlsx)">Excel</button>';
 const del='<button class="mini del" data-act="delete" data-id="'+id+'" title="Delete">Delete</button>';
 if(stage==='pipeline')return edit+letter+xls+'<button class="mini ok" data-act="hire" data-id="'+id+'">Hired</button><button class="mini warn" data-act="archive" data-id="'+id+'">Archive</button>'+del;
 if(stage==='hired')return edit+letter+xls+'<button class="mini" data-act="unstage" data-id="'+id+'">To Pipeline</button><button class="mini warn" data-act="archive" data-id="'+id+'">Archive</button>'+del;
 return edit+letter+xls+'<button class="mini" data-act="unstage" data-id="'+id+'">Restore</button>'+del;
}
// One-click Excel export of a single record (same columns as the import template, so it's re-importable).
function exportOneXlsx(id){
 const r=records.find(x=>x.id===id); if(!r){toast('Record not found.',true);return;}
 try{
   const head=[...HEADERS];
   const row=DATA_FIELDS.map(f=>(r.data&&r.data[f.id])||'');
   const wb=XLSX.utils.book_new();
   const ws=XLSX.utils.aoa_to_sheet([head,row]);
   XLSX.utils.book_append_sheet(wb,ws,'New Hire');
   const base=((r.data&&r.data.employeeName||'New Hire').replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'')||'record');
   XLSX.writeFile(wb,base+'.xlsx');
   toast('Exported '+base+'.xlsx');
 }catch(e){toast('Could not export: '+(e&&e.message||e),true);}
}
/* ---- Email compose helpers: Desktop Outlook (mailto → default mail app) or Outlook Web ---- */
function emailPref(){try{return localStorage.getItem('onhr_email_client')||'desktop';}catch(e){return 'desktop';}}
function setEmailPref(v){try{localStorage.setItem('onhr_email_client',v==='web'?'web':'desktop');}catch(e){}}
function owaComposeUrl(email,subject,body){
  return 'https://outlook.office.com/mail/deeplink/compose?to='+encodeURIComponent(email||'')
    +'&subject='+encodeURIComponent(subject||'')
    +(body?'&body='+encodeURIComponent(body):'');
}
function mailtoUrl(email,subject,body){
  var b=(body||'').replace(/\r?\n/g,'\r\n');   // CRLF so the desktop client keeps line breaks
  return 'mailto:'+(email||'')+'?subject='+encodeURIComponent(subject||'')+'&body='+encodeURIComponent(b);
}
function offerEmailSubject(rec){return 'Your Offer of Employment — All Western Mortgage';}
function offerEmailBody(rec){
  var d=(rec&&rec.data)||{};
  var first=(d.preferredName&&d.preferredName.trim())||((d.employeeName||'').trim().split(/\s+/)[0])||'there';
  return 'Hi '+first+',\n\n'
    +'Congratulations! We’re excited to extend your offer of employment with All Western Mortgage. '
    +'Your offer letter is attached — please review the details and let me know if you have any questions.\n\n'
    +'To accept, sign and return the letter at your earliest convenience. We look forward to welcoming you aboard.\n\n'
    +'Warm regards,\n';
}
// Open a pre-addressed message in whichever client the user picked (desktop by default).
function openEmailCompose(email,subject,body){
  if(emailPref()==='web'){
    window.open(owaComposeUrl(email,subject,body),'_blank','noopener');
    toast('Opening Outlook on the web — attach the saved PDF, then send.');
  }else{
    window.location.href=mailtoUrl(email,subject,body);   // opens the default mail app (Outlook desktop if set as default)
    toast('Opening your desktop mail app — attach the saved PDF, then send.');
  }
}
function openEmailFor(id){
  var rec=records.find(function(r){return r.id===id;});
  if(!rec)return;
  var email=(rec.data&&rec.data.email||'').trim();
  if(!email){toast('No email on this record.',true);return;}
  openEmailCompose(email,offerEmailSubject(rec),offerEmailBody(rec));
}
function emailViaOutlook(){
  var rec=currentLetterRecord();
  if(!rec){toast('Open a new hire first.',true);return;}
  var email=(rec.data&&rec.data.email||'').trim();
  if(!email){toast('No email on this record — add one on the New Hire Details tab.',true);return;}
  openEmailCompose(email,offerEmailSubject(rec),offerEmailBody(rec));
}
(function(){var sel=document.getElementById('emailClientPref');if(sel){sel.value=emailPref();sel.addEventListener('change',function(){setEmailPref(sel.value);if(typeof renderStageTables==='function')renderStageTables();});}})();
function renderStageTables(){
 ['pipeline','hired','archived'].forEach(function(stage){
   fillFilterSelects(stage);
   const rows=stageRows(stage);
   const tb=document.querySelector('#tbl-'+stage+' tbody'); if(!tb)return;
   tb.innerHTML=rows.map(function(r){const d=r.data;
     return '<tr data-id="'+r.id+'">'
       +'<td class="c-chk">'+(stage==='pipeline'?'<input type="checkbox" class="rowchk" data-id="'+r.id+'">':'')+'</td>'
       +'<td><span class="rowname" data-id="'+r.id+'">'+esc(d.employeeName||d.preferredName||'(no name)')+'</span></td>'
       +'<td>'+esc(d.branchName||'')+'</td>'
       +'<td>'+esc(d.position||'')+'</td>'
       +'<td class="c-email">'+(d.email?'<a href="'+esc(mailtoUrl(d.email,offerEmailSubject(r),offerEmailBody(r)))+'" class="email-link" title="Email '+esc(d.email)+'" onclick="event.stopPropagation();openEmailFor(\''+r.id+'\');return false;">'+esc(d.email)+'</a>':'')+'</td>'
       +'<td>'+esc(fmtShort(offerDateISO(r)))+'</td>'
       +'<td class="c-act">'+stageActions(stage,r.id)+'</td></tr>';
   }).join('');
   const empty=document.getElementById('empty-'+stage);
   if(empty){empty.style.display=rows.length?'none':'block';if(!rows.length)empty.textContent=stageHasFilter(stage)?'No matches for these filters.':'No one here yet.';}
 });
 updateTabCounts(); updateMassBtn();
 const all=document.getElementById('chkAllPipeline'); if(all)all.checked=false;
}
function updateTabCounts(){const c={pipeline:0,hired:0,archived:0};records.forEach(r=>{const s=stageOf(r);c[s]=(c[s]||0)+1;});
 const set=(v,n)=>{const t=document.querySelector('.tab[data-view="'+v+'"]');if(t)t.textContent=n;};
 set('pipeline','Pipeline ('+c.pipeline+')');set('hired','Hired ('+c.hired+')');set('archived','Archived ('+c.archived+')');}
function selectedPipelineIds(){return [].slice.call(document.querySelectorAll('#tbl-pipeline .rowchk:checked')).map(c=>c.dataset.id);}
function updateMassBtn(){const n=selectedPipelineIds().length;const b=document.getElementById('btnMassOffer');if(b)b.textContent='Generate Offer Letters PDF ('+n+')';const bw=document.getElementById('btnMassOfferWord');if(bw)bw.textContent='Generate Offer Letters Word ('+n+')';const db=document.getElementById('btnDeleteSel');if(db)db.textContent='Delete Selected ('+n+')';const sb=document.getElementById('btnMassSignatory');if(sb)sb.textContent='Assign ('+n+')';const xc=document.getElementById('btnExportSelCsv');if(xc)xc.textContent='Export CSV ('+n+')';}
// ---- Bulk-assign the AWM signing party (signatory) across many records ----
function reEsc(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function swapSigInHtml(html,sg){
 // Replace any known signatory "Name<br>Title" block with the new signer, ignoring
 // surrounding markup so it works even after the browser normalizes inline styles.
 var out=html;
 Object.keys(SIGNATORY).forEach(function(k){var o=SIGNATORY[k];
   var re=new RegExp('>\\s*(?:<strong>)?\\s*'+reEsc(o.name)+'\\s*(?:</strong>)?\\s*<br\\s*/?>\\s*(?:<strong>)?\\s*'+reEsc(o.title)+'\\s*(?:</strong>)?\\s*<','gi');
   out=out.replace(re,'><strong>'+esc(sg.name)+'</strong><br>'+esc(sg.title)+'<');});
 return out;}
function applySignatory(ids,key){
 var sg=SIGNATORY[key]; if(!sg)return; var n=0,patched=0,custom=0;
 ids.forEach(function(id){var rec=records.find(function(r){return r.id===id;});if(!rec)return;
   rec.letter=rec.letter||{}; rec.letter.signatory=key;
   if(rec.letterHtml){var np=swapSigInHtml(rec.letterHtml,sg);if(np!==rec.letterHtml){rec.letterHtml=np;patched++;}else{custom++;}}
   n++;});
 persist();
 if(curRec&&ids.indexOf(curRec.id)>=0&&document.getElementById('letterContent')){L=resolveLetter(curRec);if(letterEditIsCurrent(curRec))loadEditedLetter();else regen();}
 renderStageTables();
 var msg='Signer set to '+sg.name+' on '+n+' request'+(n!==1?'s':'')+'.';
 if(patched)msg+=' '+patched+' finalized letter'+(patched!==1?'s':'')+' updated in place.';
 if(custom)msg+=' '+custom+' edited letter'+(custom!==1?'s have':' has')+' a custom signature — open to change.';
 toast(msg);}
function bulkAssignSignatory(){
 var sel=document.getElementById('massSignatory'); var key=sel?sel.value:'';
 if(!key){toast('Pick a signer from the dropdown first.',true);return;}
 var sg=SIGNATORY[key];
 var ids=selectedPipelineIds();
 if(ids.length){applySignatory(ids,key);return;}
 var allIds=stageRows('pipeline').map(function(r){return r.id;});
 if(!allIds.length){toast('No requests in this list.',true);return;}
 confirmModal('Assign signer to all?','No rows are checked. Set '+sg.name+' as the AWM signing party on all '+allIds.length+' request'+(allIds.length!==1?'s':'')+' in this list?',function(){applySignatory(allIds,key);});}
function initSignatoryPicker(){var sel=document.getElementById('massSignatory');if(!sel)return;
 sel.innerHTML='<option value="">Set signer to…</option>'+Object.keys(SIGNATORY).map(function(k){return '<option value="'+k+'">'+esc(SIGNATORY[k].name)+' – '+esc(SIGNATORY[k].title)+'</option>';}).join('');}

function showView(v){currentView=v;
 document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===v));
 document.querySelectorAll('.view').forEach(s=>s.classList.toggle('active',s.id==='view-'+v));
 const te=document.getElementById('tabEditor'); if(te)te.style.display=(v==='editor')?'':'none';
 if(v==='analysis')renderAnalysis(); else if(v!=='editor')renderStageTables();
 window.scrollTo({top:0});
}
function statCard(label,n,sub,cls){return '<div class="stat '+(cls||'')+'"><div class="stat-n">'+n+'</div><div class="stat-l">'+esc(label)+'</div>'+(sub!=null?'<div class="stat-s">'+esc(sub)+'</div>':'')+'</div>';}
function renderAnalysis(){const body=document.getElementById('analysisBody');if(!body)return;
 const total=records.length;
 const hired=records.filter(r=>stageOf(r)==='hired').length;
 const archived=records.filter(r=>stageOf(r)==='archived').length;
 const pending=records.filter(r=>stageOf(r)==='pipeline').length;
 const pct=n=>total?Math.round(n/total*100):0;
 const months={};records.forEach(function(r){const k=monthKeyOf(r)||'';const M=months[k]||(months[k]={total:0,hired:0,archived:0,pipeline:0});M.total++;M[stageOf(r)]++;});
 const keys=Object.keys(months).filter(k=>k).sort();
 const maxT=Math.max(1,...keys.map(k=>months[k].total));
 const bars=keys.map(function(k){const m=months[k];const h=Math.max(3,Math.round(m.total/maxT*100));return '<div class="bar"><div class="bar-fill" style="height:'+h+'%"><span>'+m.total+'</span></div><div class="bar-lbl">'+esc(fmtMonthKey(k))+'</div></div>';}).join('');
 let mt='<table class="an-table"><thead><tr><th>Month</th><th>Offers</th><th>Accepted</th><th>Not accepted</th><th>Pending</th><th>Accept % (of decided)</th></tr></thead><tbody>';
 keys.forEach(function(k){const m=months[k];const dec=m.hired+m.archived;const ap=dec?Math.round(m.hired/dec*100):0;
   mt+='<tr><td>'+esc(fmtMonthKey(k))+'</td><td>'+m.total+'</td><td>'+m.hired+'</td><td>'+m.archived+'</td><td>'+m.pipeline+'</td><td>'+ap+'%</td></tr>';});
 mt+='</tbody></table>';
 body.innerHTML='<div class="stat-row">'
   +statCard('Total offers',total,null)
   +statCard('Accepted (Hired)',hired,pct(hired)+'% of offers','ok')
   +statCard('Not accepted (Archived)',archived,pct(archived)+'% of offers','warn')
   +statCard('Pending',pending,pct(pending)+'% of offers','muted')
   +'</div>'
   +'<h3 class="an-h">Offers by month</h3><div class="barchart">'+(bars||'<p class="muted">No offers yet.</p>')+'</div>'
   +'<h3 class="an-h">Monthly breakdown</h3>'+(keys.length?mt:'<p class="muted">No dated offers yet.</p>');
}
function buildLettersDoc(title,sheets){
 const css="*{box-sizing:border-box}body{margin:0;background:#5b6675;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111}"
 +".ctrl{position:sticky;top:0;z-index:10;background:#1b2a4a;color:#fff;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 16px}.ctrl strong{font-size:15px}.ctrl .sp{flex:1}"
 +".ctrl label{display:flex;align-items:center;gap:6px;font-size:13px;background:rgba(255,255,255,.12);padding:5px 10px;border-radius:7px}.ctrl select{padding:6px 8px;border-radius:6px;border:1px solid #2a3a5c}.ctrl button{cursor:pointer;border:none;border-radius:7px;padding:8px 14px;font-weight:600;background:#2f5fd0;color:#fff;font-size:13px}"
 +".sheet{position:relative;background:#fff;width:8.5in;min-height:11in;margin:26px auto;box-shadow:0 6px 30px rgba(0,0,0,.35);padding:.6in .75in .7in}"
 +".letter-content{font-family:Calibri,Segoe UI,Arial,sans-serif;font-size:11pt;line-height:1.42;position:relative;z-index:2}"
 +".letter-table{width:100%;border-collapse:collapse}.letter-table>tbody>tr>td,.letter-table>tfoot>tr>td{padding:0;border:none}.lp-foot{text-align:center;font-size:8.5pt;color:#333;line-height:1.35;padding-top:16px}"
 +".letter-content .logo{width:2.5in;margin:0 0 18px}.letter-content .date-line{text-align:right;margin-bottom:14px}.letter-content p{margin:0 0 9px}.letter-content .addr div{line-height:1.35}"
 +".letter-content h3.sec{font-size:12.5pt;font-weight:700;margin:16px 0 8px}.letter-content ul{margin:0 0 9px;padding-left:22px}.letter-content ul li{margin-bottom:4px}"
 +".comp-table{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:10pt}.comp-table th,.comp-table td{border:1px solid #b9c2d0;padding:7px 9px;vertical-align:top;text-align:left}.comp-table th{background:#eef2f9;font-weight:700}.comp-table td:first-child{font-weight:700;width:20%}.comp-table td:nth-child(2){width:34%}"
 +".comp-plan .cp-line{margin:0 0 9px}.cp-pct{font-weight:700}.sig-name{margin-top:2px}.letter-content .ack{margin-top:26px}"
 +".wm{position:absolute;inset:0;overflow:hidden;z-index:1;pointer-events:none;display:none}.wm.on{display:block}.wmi{position:absolute;top:-25%;left:-25%;width:150%;height:150%;display:flex;flex-wrap:wrap;gap:70px 46px;transform:rotate(-30deg)}.wmi span{color:rgba(200,30,30,.12);font-size:46px;font-weight:800;letter-spacing:5px;white-space:nowrap;font-family:Arial}"
 +"@media print{.ctrl{display:none}body{background:#fff}.sheet{box-shadow:none;margin:0;width:auto;min-height:0;padding:0;page-break-after:always}.sheet:last-child{page-break-after:auto}@page{size:letter;margin:.55in .7in .55in}}";
 const js="var WM={on:false};function rwm(){var on=document.getElementById('wmOn').checked,t=document.getElementById('wmSel').value;document.querySelectorAll('[data-wm]').forEach(function(wl){var sheet=wl.parentElement;if(!on){wl.className='wm';wl.innerHTML='';return;}wl.className='wm on';var h=sheet.scrollHeight||1100;var n=(Math.ceil(h/120)+2)*6;var s='';for(var i=0;i<n;i++){s+='<span>'+t+'</span>';}wl.innerHTML='<div class=\"wmi\">'+s+'</div>';});}document.getElementById('wmOn').onchange=rwm;document.getElementById('wmSel').onchange=rwm;";
 return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+css+'</style></head><body>'
  +'<div class="ctrl"><strong>'+esc(title)+'</strong><span class="sp"></span><label><input type="checkbox" id="wmOn"> Watermark</label><select id="wmSel"><option>SAMPLE</option><option>PROOF</option><option>DRAFT</option><option>COPY</option><option>CONFIDENTIAL</option></select><button onclick="window.print()">Print / Save as PDF</button></div>'
  +sheets+'<scr'+'ipt>'+js+'</scr'+'ipt></body></html>';
}
/* minimal STORE-method zip writer (self-contained, no libraries) */
const _CRC=(function(){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=_CRC[(c^u8[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function _cat(arrs){let len=0;arrs.forEach(a=>len+=a.length);const out=new Uint8Array(len);let o=0;arrs.forEach(a=>{out.set(a,o);o+=a.length;});return out;}
function _u16(n){return new Uint8Array([n&255,(n>>8)&255]);}
function _u32(n){return new Uint8Array([n&255,(n>>8)&255,(n>>16)&255,(n>>>24)&255]);}
function makeZip(files){const enc=new TextEncoder();const parts=[],central=[];let offset=0;
 files.forEach(function(f){const nm=enc.encode(f.name);const data=f.bytes;const crc=crc32(data);
  const lh=_cat([_u32(0x04034b50),_u16(20),_u16(0),_u16(0),_u16(0),_u16(0),_u32(crc),_u32(data.length),_u32(data.length),_u16(nm.length),_u16(0),nm]);
  parts.push(lh,data);
  const cd=_cat([_u32(0x02014b50),_u16(20),_u16(20),_u16(0),_u16(0),_u16(0),_u16(0),_u32(crc),_u32(data.length),_u32(data.length),_u16(nm.length),_u16(0),_u16(0),_u16(0),_u16(0),_u32(0),_u32(offset),nm]);
  central.push(cd); offset+=lh.length+data.length;});
 const cbytes=_cat(central);const eocd=_cat([_u32(0x06054b50),_u16(0),_u16(0),_u16(files.length),_u16(files.length),_u32(cbytes.length),_u32(offset),_u16(0)]);
 return _cat(parts.concat([cbytes,eocd]));}
function drawLetterFooter(doc,pageW,pageH){doc.setFontSize(8.5);doc.setTextColor(70);
 doc.text('All Western Mortgage, Inc.  •  8345 W. Sunset Rd. #380',pageW/2,pageH-34,{align:'center'});
 doc.text('Las Vegas, NV 89113  •  Main 702.369.0905  •  Fax 702.920.8421',pageW/2,pageH-22,{align:'center'});}
function drawWatermark(doc,pageW,pageH,text){text=String(text||'SAMPLE');
 try{doc.saveGraphicsState();doc.setGState(new doc.GState({opacity:0.12}));}catch(e){}
 doc.setTextColor(200,30,30);doc.setFont('helvetica','bold');doc.setFontSize(44);
 for(var yy=70;yy<pageH+130;yy+=130){for(var xx=-30;xx<pageW+170;xx+=185){doc.text(text,xx,yy,{angle:30});}}
 try{doc.restoreGraphicsState();}catch(e){}
 doc.setTextColor(70);doc.setFont('helvetica','normal');doc.setFontSize(8.5);}
async function letterToPdfBytes(r,wm){const saveL=L,saveRec=curRec;curRec=r;L=resolveLetter(r);const body=letterInnerFor(r);L=saveL;curRec=saveRec;
 const stage=document.getElementById('pdfStage');stage.innerHTML='<div class="letter-content" style="width:720px;padding:0;background:#fff">'+body+'</div>';
 const el=stage.firstChild;const canvas=await html2canvas(el,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false});stage.innerHTML='';
 const jsPDF=window.jspdf.jsPDF;const doc=new jsPDF({unit:'pt',format:'letter'});
 const pageW=612,pageH=792,mL=54,mR=54,mT=42,mB=52;const contentW=pageW-mL-mR,contentH=pageH-mT-mB;
 const cw=canvas.width,ch=canvas.height,pxPerPt=cw/contentW,slicePx=Math.floor(contentH*pxPerPt);
 const fctx=canvas.getContext('2d');
 // Find a near-blank horizontal line between target and minY so a page break never cuts through
 // a line of text or a table row. Rows crossing only thin vertical borders count as blank.
 function safeBreak(target,minY){
   if(target>=ch)return ch; if(target<=minY)return target;
   const h=target-minY; let data;
   try{data=fctx.getImageData(0,minY,cw,h).data;}catch(e){return target;}
   const limit=Math.max(6,Math.floor(cw*0.015));
   for(let ry=h-1;ry>=0;ry--){const b=ry*cw*4;let ink=0,bad=false;
     for(let x=0;x<cw;x++){const p=b+x*4;if(data[p]<245||data[p+1]<245||data[p+2]<245){if(++ink>limit){bad=true;break;}}}
     if(!bad)return minY+ry;}
   return target;
 }
 let y=0,page=0;
 while(y<ch){
   let sh;
   if(ch-y<=slicePx){sh=ch-y;}
   else{const cut=safeBreak(y+slicePx,y+Math.floor(slicePx*0.55));sh=cut-y;if(sh<40)sh=Math.min(slicePx,ch-y);}
   const tmp=document.createElement('canvas');tmp.width=cw;tmp.height=sh;const ctx=tmp.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,cw,sh);ctx.drawImage(canvas,0,y,cw,sh,0,0,cw,sh);
   const img=tmp.toDataURL('image/jpeg',0.92);if(page>0)doc.addPage();doc.addImage(img,'JPEG',mL,mT,contentW,sh/pxPerPt);if(wm&&wm.on)drawWatermark(doc,pageW,pageH,wm.text);drawLetterFooter(doc,pageW,pageH);y+=sh;page++;
 }
 return new Uint8Array(doc.output('arraybuffer'));}
async function exportMassLetters(ids){if(!ids.length){toast('Select at least one candidate.',true);return;}
 if(!window.jspdf||!window.html2canvas){toast('PDF engine not available.',true);return;}
 const wm={on:!!(document.getElementById('massWmOn')&&document.getElementById('massWmOn').checked),text:'SAMPLE'};
 toast('Generating '+ids.length+' PDF'+(ids.length!==1?'s':'')+(wm.on?' (watermarked)':'')+'…');
 const used={};const files=[];
 for(let i=0;i<ids.length;i++){const r=records.find(x=>x.id===ids[i]);if(!r)continue;
   try{const bytes=await letterToPdfBytes(r,wm);let base=((r.data.employeeName||'New Hire').replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'')||'letter');if(used[base]){used[base]++;base=base+'_'+used[base];}else used[base]=1;files.push({name:'Offer_Letter_'+base+'.pdf',bytes:bytes});}catch(e){}
 }
 if(!files.length){toast('Could not generate PDFs.',true);return;}
 downloadBlob(new Blob([makeZip(files)],{type:'application/zip'}),'Offer_Letters_'+dstamp()+'.zip');
 toast('Generated a zip with '+files.length+' PDF'+(files.length!==1?'s':'')+'.');}
document.getElementById('tabbar').addEventListener('click',function(e){const t=e.target.closest('.tab');if(t)showView(t.dataset.view);});
document.querySelectorAll('.f-name').forEach(s=>s.addEventListener('input',renderStageTables));
document.querySelectorAll('.f-branch,.f-title').forEach(s=>s.addEventListener('change',renderStageTables));
document.querySelectorAll('.f-clear').forEach(b=>b.addEventListener('click',function(){const st=b.dataset.stage;['f-name','f-branch','f-title'].forEach(function(k){const el=document.querySelector('.'+k+'[data-stage="'+st+'"]');if(el)el.value='';});renderStageTables();}));
document.getElementById('btnNew2').addEventListener('click',function(){showView('editor');newRecord();showSub('details');});
document.getElementById('btnMassOffer').addEventListener('click',function(){exportMassLetters(selectedPipelineIds());});
document.getElementById('btnMassOfferWord').addEventListener('click',function(){exportMassLettersWord(selectedPipelineIds());});
initSignatoryPicker();
(function(){var sb=document.getElementById('btnMassSignatory');if(sb)sb.addEventListener('click',bulkAssignSignatory);})();
(function(){var xc=document.getElementById('btnExportSelCsv');if(xc)xc.addEventListener('click',function(){exportSelectedCsv(selectedPipelineIds());});})();
document.getElementById('btnDeleteSel').addEventListener('click',function(){const ids=selectedPipelineIds();if(!ids.length){toast('Select at least one to delete.',true);return;}confirmModal('Delete selected','Permanently delete '+ids.length+' selected record'+(ids.length!==1?'s':'')+'? This cannot be undone.',function(){records=records.filter(r=>ids.indexOf(r.id)<0);persist();renderStageTables();toast('Deleted '+ids.length+' record'+(ids.length!==1?'s':'')+'.');});});
['view-pipeline','view-hired','view-archived'].forEach(function(vid){
 document.getElementById(vid).addEventListener('click',function(e){
   const a=e.target.closest('[data-act]');
   if(a){e.preventDefault();const id=a.dataset.id,act=a.dataset.act;
     if(act==='edit'){showView('editor');openRecord(id);showSub('details');}
     else if(act==='letter'){showView('editor');openRecord(id);openLetter();}
     else if(act==='excel'){exportOneXlsx(id);}
     else if(act==='hire')setStage(id,'hired');
     else if(act==='archive')setStage(id,'archived');
     else if(act==='unstage')setStage(id,'pipeline');
     else if(act==='delete'){const r=records.find(x=>x.id===id);confirmModal('Delete permanently','Permanently delete '+((r&&r.data.employeeName)||'this record')+'? This cannot be undone.',function(){records=records.filter(x=>x.id!==id);if(currentId===id)currentId=null;persist();renderStageTables();toast('Deleted.');});}
     return;}
   const nm=e.target.closest('.rowname'); if(nm){showView('editor');openRecord(nm.dataset.id);openLetter();return;}
   if(e.target.classList.contains('rowchk')){updateMassBtn();return;}
   if(e.target.id==='chkAllPipeline'){document.querySelectorAll('#tbl-pipeline .rowchk').forEach(c=>c.checked=e.target.checked);updateMassBtn();return;}
 });
});
document.getElementById('btnNew').addEventListener('click',function(){showView('editor');showSub('details');});
(function(){ if(typeof renderList==='function'){ const _rl=renderList; renderList=function(){ _rl.apply(this,arguments); try{ if(document.getElementById('tbl-pipeline')) renderStageTables(); }catch(e){} }; } })();
(function(){var sl=document.getElementById('sub-letter'),ov=document.getElementById('letterOverlay');if(sl&&ov)sl.appendChild(ov);})();
function showSub(sub){document.querySelectorAll('.subtab').forEach(t=>t.classList.toggle('active',t.dataset.sub===sub));document.querySelectorAll('#view-editor .subview').forEach(v=>v.classList.toggle('active',v.id==='sub-'+sub));window.scrollTo({top:0});}
document.getElementById('subtabs').addEventListener('click',function(e){var t=e.target.closest('.subtab');if(!t)return;if(t.dataset.sub==='letter'){openLetter();}else{showSub('details');}});
/* ===================== INTAKE SYNC (code / link / same-browser inbox) ===================== */
function encRec(obj){return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decRec(s){s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return JSON.parse(decodeURIComponent(escape(atob(s))));}
const IMPORTED_KEY='onhr_imported_sids';
function importedSids(){try{return JSON.parse(localStorage.getItem(IMPORTED_KEY)||'[]');}catch(e){return [];}}
function markImported(sid){if(!sid)return;var a=importedSids();if(a.indexOf(sid)<0){a.push(sid);if(a.length>800)a=a.slice(-800);localStorage.setItem(IMPORTED_KEY,JSON.stringify(a));}}
function addSubmission(sub){if(!sub||!sub.data)return false;if(sub.sid&&importedSids().indexOf(sub.sid)>=0)return false;
  var d={};DATA_FIELDS.forEach(function(f){d[f.id]='';});Object.assign(d,sub.data);
  records.unshift({id:uid(),data:d,status:missingRequired(d).length?'draft':'complete',created:sub.submitted||nowIso(),updated:nowIso(),stage:'pipeline'});
  markImported(sub.sid);persist();return true;}
function importCode(str){str=(str||'').trim();if(!str){toast('Nothing to import.',true);return;}var m=str.match(/rec=([A-Za-z0-9_\-]+)/);var code=m?m[1]:str;code=code.replace(/^AWM1-/,'');try{var sub=decRec(code);if(!sub||!sub.data){toast('Not a valid intake code.',true);return;}var ok=addSubmission(sub);renderStageTables();showView('pipeline');toast(ok?('Imported '+((sub.data&&sub.data.employeeName)||'request')+'.'):'That request was already imported.');}catch(e){toast('Could not read that code.',true);}}
function pollInbox(){try{var inbox=JSON.parse(localStorage.getItem('onhr_inbox')||'[]');if(!inbox.length)return;var added=0;inbox.forEach(function(sub){if(sub&&sub.data&&addSubmission(sub))added++;});localStorage.setItem('onhr_inbox','[]');if(added){renderStageTables();toast(added+' new request'+(added!==1?'s':'')+' synced from the intake form.');}}catch(e){}}
(function(){var h=location.hash||'';var m=h.match(/rec=([A-Za-z0-9_\-]+)/);if(m){try{importCode(m[1]);history.replaceState(null,'',location.pathname+location.search);}catch(e){}}})();
setInterval(pollInbox,2500);window.addEventListener('storage',function(e){if(e.key==='onhr_inbox')pollInbox();});pollInbox();
function openCodeImport(){openModal('Import from Code / Link','<p style="margin:0 0 8px">Paste a submission <b>code</b> or a prefilled <b>link</b> from an intake form:</p><textarea id="codeIn" rows="4" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:7px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px"></textarea>','<button class="btn-light" id="ciCancel">Cancel</button><button class="btn-primary" id="ciGo">Import</button>');document.getElementById('ciCancel').onclick=closeModal;document.getElementById('ciGo').onclick=function(){var v=document.getElementById('codeIn').value;closeModal();importCode(v);};}
document.getElementById('btnImportCode').addEventListener('click',openCodeImport);

renderStageTables(); showView('pipeline');
</script>
</body>
</html>
